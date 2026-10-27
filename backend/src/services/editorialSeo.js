const sanitizeHtml=require('sanitize-html');
const crypto=require('crypto');
const covers=require('../data/social-covers.json');
const siteUrl=(process.env.PUBLIC_SITE_URL||'https://findtheweb.zus3cu.tech').replace(/\/$/,'');
function imageUrl(value){
 try{const url=new URL(value||'/logo.png',siteUrl);return ['https:','http:'].includes(url.protocol)&&!url.username&&!url.password?url.href:siteUrl+'/logo.png';}catch(_){return siteUrl+'/logo.png';}
}
function socialImageFor(slug,image){
 const entry=covers[slug];
 return entry && entry.sourceSha256===crypto.createHash('sha256').update(image||'').digest('hex')?entry.url:imageUrl(image);
}
function cleanContent(content){return sanitizeHtml(content||'',{
 allowedTags:[...sanitizeHtml.defaults.allowedTags,'img','figure','figcaption'],
 allowedAttributes:{a:['href','title','rel'],img:['src','alt','width','height','loading'],th:['scope'],code:['class'],figure:['class'],ol:['start']},
 allowedClasses:{code:['language-*'],figure:['article-flow']},
 allowedSchemes:['http','https','mailto'],allowProtocolRelative:false,
 transformTags:{h1:'h2',a:sanitizeHtml.simpleTransform('a',{rel:'noopener noreferrer'})},
});}
function publicArticle(post){
 const data=post.toJSON?post.toJSON():post;
 const image=imageUrl(data.featuredImage),socialImage=socialImageFor(data.slug,data.featuredImage);
 return {slug:data.slug,title:data.title,description:data.seoDescription||data.excerpt||'',seoTitle:data.seoTitle||data.title,
  excerpt:data.excerpt||'',content:cleanContent(data.content),image,socialImage,readingImage:/\.(?:webp|png|jpe?g)(?:[?#]|$)/i.test(data.featuredImage||'')?image:socialImage,
  publishedAt:data.publishedAt,updatedAt:data.updatedAt,author:{name:data.author?.name||'FindTheWeb Editorial'},
  canonical:siteUrl+'/blog/'+encodeURIComponent(data.slug)};
}
module.exports={cleanContent,publicArticle,socialImageFor};
