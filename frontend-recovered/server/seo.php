<?php
declare(strict_types=1);
// Published-only rendering. No cookies, credentials, client headers or arbitrary
// destination URLs are forwarded to the API. Every visitor receives the same HTML.
const SITE = 'https://findtheweb.zus3cu.tech';
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');
if (!in_array($_SERVER['REQUEST_METHOD'] ?? 'GET', ['GET','HEAD'], true)) {
    http_response_code(405); header('Allow: GET, HEAD'); exit;
}
function h(string $text): string { return htmlspecialchars($text, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8'); }
function upstream(string $path): array {
    $base = rtrim(getenv('FINDTHEWEB_SEO_API_BASE') ?: 'https://api.zus3cu.tech/findtheweb', '/');
    $url = parse_url($base);
    $local = ($url['scheme'] ?? '') === 'http' && in_array($url['host'] ?? '', ['127.0.0.1','localhost'], true);
    if (!$local && $base !== 'https://api.zus3cu.tech/findtheweb') return [503, ''];
    $context = stream_context_create(['http'=>[
        'method'=>'GET', 'timeout'=>5, 'ignore_errors'=>true, 'follow_location'=>0,
        'header'=>"Accept: application/json, application/xml\r\nUser-Agent: FindTheWeb-Published-Renderer/1.0\r\n"
    ],'ssl'=>['verify_peer'=>true,'verify_peer_name'=>true]]);
    $body = @file_get_contents($base . $path, false, $context, 0, 2097153);
    $status = 503;
    foreach ($http_response_header ?? [] as $line) if (preg_match('#^HTTP/\S+\s+(\d{3})#', $line, $match)) $status = (int)$match[1];
    if ($body === false || strlen($body) > 2097152) return [503, ''];
    return [$status, $body];
}
function render(array $article, int $status): void {
    http_response_code($status); header('Content-Type: text/html; charset=utf-8');
    if ($status === 503) header('Retry-After: 60');
    $template = file_get_contents(__DIR__.'/index.html');
    if ($template === false) { http_response_code(503); echo 'Temporarily unavailable'; return; }
    $title = $article['seoTitle'] ?? ($status===404 ? 'Article not found' : 'Article temporarily unavailable');
    $description = $article['description'] ?? 'Browse published guides in the FindTheWeb journal.';
    $headEnd = strpos($template, '</head>');
    $head = substr($template, 0, $headEnd);
    $rest = substr($template, $headEnd);
    $head = preg_replace('#<title\b[^>]*>.*?</title>#is', '', $head);
    $head = preg_replace('#<meta\b[^>]*(?:name|property)=["\'](?:title|description|keywords|author|robots|og:[^"\']+|twitter:[^"\']+)["\'][^>]*>#i', '', $head);
    $head = preg_replace('#<link\b[^>]*rel=["\']canonical["\'][^>]*>#i', '', $head);
    $meta = '<title>'.h($title).' | FindTheWeb</title><meta name="description" content="'.h($description).'">';
    $meta .= '<meta name="robots" content="'.($status===200 ? 'index,follow' : 'noindex,nofollow').'">';
    $body = '<main class="seo-copy"><h1>'.h($title).'</h1><p>'.h($description).'</p><a href="/blog">Browse the journal</a></main>';
    if ($status===200) {
        $canonical = SITE.'/blog/'.rawurlencode($article['slug']);
        $image = $article['socialImage'];
        $meta .= '<link rel="canonical" href="'.h($canonical).'">';
        foreach (['og:type'=>'article','og:title'=>$title,'og:description'=>$description,'og:url'=>$canonical,'og:image'=>$image,'og:site_name'=>'FindTheWeb'] as $key=>$value) $meta .= '<meta property="'.$key.'" content="'.h($value).'">';
        foreach (['twitter:card'=>'summary_large_image','twitter:title'=>$title,'twitter:description'=>$description,'twitter:image'=>$image] as $key=>$value) $meta .= '<meta name="'.$key.'" content="'.h($value).'">';
        $schema = ['@context'=>'https://schema.org','@type'=>'BlogPosting','headline'=>$article['title'],'description'=>$description,'image'=>[$image],'url'=>$canonical,'mainEntityOfPage'=>$canonical,'datePublished'=>$article['publishedAt'],'dateModified'=>$article['updatedAt'],'author'=>['@type'=>'Person','name'=>$article['author']['name']],'publisher'=>['@type'=>'Organization','name'=>'FindTheWeb','url'=>SITE]];
        $meta .= '<script data-rh="true" type="application/ld+json">'.json_encode($schema, JSON_HEX_TAG|JSON_HEX_AMP|JSON_HEX_APOS|JSON_HEX_QUOT|JSON_UNESCAPED_SLASHES).'</script>';
        // content is sanitized by the dedicated API endpoint before reaching this renderer.
        $body = '<main id="seo-article" class="seo-copy"><nav><a href="/">FindTheWeb</a> / <a href="/blog">Journal</a></nav><article><h1>'.h($article['title']).'</h1><p>'.h($article['excerpt']).'</p><p>By '.h($article['author']['name']).'</p><img class="seo-cover" src="'.h($image).'" alt="'.h($article['title']).'" width="1200" height="630"><div class="seo-body">'.$article['content'].'</div></article></main>';
    }
    $rest = str_replace('<div id="root"></div>', '<div id="root">'.$body.'</div>', $rest);
    echo $head . $meta . $rest;
}
$kind = $_GET['kind'] ?? 'article';
if ($kind === 'sitemap' || $kind === 'rss') {
    [$status,$body] = upstream('/api/v1/seo/'.($kind==='sitemap'?'sitemap.xml':'rss.xml'));
    if ($status!==200 || !preg_match($kind==='sitemap' ? '#<urlset\b#' : '#<rss\b#', $body)) {
        http_response_code(503); header('Retry-After: 60'); header('X-Robots-Tag: noindex'); echo 'Feed temporarily unavailable'; exit;
    }
    header('Content-Type: '.($kind==='sitemap'?'application/xml':'application/rss+xml').'; charset=utf-8'); echo $body; exit;
}
$slug = $_GET['slug'] ?? '';
if ($kind!=='article' || !is_string($slug) || !preg_match('/^[A-Za-z0-9][A-Za-z0-9_-]{0,254}$/D', $slug)) { render([],404); exit; }
[$status,$body] = upstream('/api/v1/seo/articles/'.rawurlencode($slug));
$payload = json_decode($body,true);
if ($status===404) { render([],404); exit; }
$article = $payload['data'] ?? null;
$valid = $status===200 && is_array($article) && ($article['slug'] ?? null)===$slug;
foreach (['title','seoTitle','description','excerpt','content','socialImage','publishedAt','updatedAt'] as $field) $valid = $valid && is_string($article[$field] ?? null);
$valid = $valid && is_string($article['author']['name'] ?? null);
$image = parse_url($article['socialImage'] ?? '');
$valid = $valid && in_array($image['scheme'] ?? '', ['https','http'], true) && empty($image['user']) && empty($image['pass']);
if (!$valid) { render([],503); exit; }
render($article,200);
