(function () {
  'use strict';
  var api = 'https://api.zus3cu.tech/findtheweb/api/v1/contact';
  function text(tag, value) { var node=document.createElement(tag);node.textContent=value;return node; }
  function json(url, options) {
    return fetch(url,options).then(function(r){return r.json().then(function(j){if(!r.ok||!j.success)throw new Error(j.message||'Unable to complete request.');return j;});});
  }
  function enhanceContact() {
    if(location.pathname!=='/contact')return;
    var form=document.querySelector('#root form');
    if(!form||form.dataset.ftwContact)return;
    form.dataset.ftwContact='true';
    form.removeAttribute('action');
    var bounds={name:100,email:254,subject:200,message:10000};
    Object.keys(bounds).forEach(function(key){var input=form.elements.namedItem(key);if(input){input.required=true;input.maxLength=bounds[key];}});
    var status=text('p','Messages are saved privately in our support inbox.');status.setAttribute('role','status');status.setAttribute('aria-live','polite');form.appendChild(status);
    var sending=false;
    form.addEventListener('submit',function(event){
      event.preventDefault();event.stopImmediatePropagation();
      if(sending||!form.reportValidity())return;
      sending=true;
      var button=form.querySelector('button[type="submit"]');var label=button.textContent;button.disabled=true;button.textContent='Saving…';status.textContent='Saving your message…';
      var fields=new FormData(form);var body={};Object.keys(bounds).forEach(function(key){body[key]=fields.get(key);});body._honey=fields.get('_honey')||'';
      json(api,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(body)})
        .then(function(j){status.textContent='Message saved. Reference: '+j.reference+'. Our team can review it in the support inbox.';})
        .catch(function(e){status.textContent=e.message+' Your message remains in the form so you can retry.';})
        .finally(function(){sending=false;button.disabled=false;button.textContent=label;});
    },true);
  }
  function renderInbox() {
    if(location.pathname!=='/admin/messages')return;
    var root=document.getElementById('root');if(root)root.style.display='none';
    if(document.getElementById('ftw-inbox'))return;
    document.title='Support Inbox | FindTheWeb';
    var robots=document.querySelector('meta[name="robots"]');if(robots)robots.content='noindex, nofollow';
    var main=document.createElement('main');main.id='ftw-inbox';main.className='ftw-moderation-page';
    var back=text('a','← Admin dashboard');back.href='/admin';main.appendChild(back);main.appendChild(text('h1','Support inbox'));
    var note=text('p','Loading messages…');note.setAttribute('role','status');main.appendChild(note);
    var list=document.createElement('section');main.appendChild(list);
    var controls=document.createElement('div');var previous=text('button','Previous');var next=text('button','Next');var refresh=text('button','Refresh');controls.append(previous,next,refresh);main.appendChild(controls);document.body.appendChild(main);
    var token=localStorage.getItem('adminToken');var page=1;var pages=0;
    function load(){
      previous.disabled=true;next.disabled=true;refresh.disabled=true;note.textContent='Loading messages…';list.replaceChildren();
      if(!token){note.textContent='Sign in as an administrator to read messages.';var login=text('a','Admin sign in');login.href='/admin/login';list.appendChild(login);refresh.disabled=false;return;}
      json(api+'/messages?page='+page,{headers:{Authorization:'Bearer '+token}}).then(function(j){
        pages=j.pagination.pages;note.textContent=j.pagination.total+' messages · Page '+page+' of '+Math.max(1,pages);
        j.data.forEach(function(message){
          var card=document.createElement('article');card.className='ftw-moderation-card';var details=document.createElement('div');
          details.append(text('h2',message.subject),text('p',message.name+' · '+message.email),text('small',new Date(message.createdAt).toLocaleString()+' · '+message.status));
          var content=text('p',message.message);content.style.whiteSpace='pre-wrap';content.style.overflowWrap='anywhere';details.appendChild(content);card.appendChild(details);
          var read=text('button',message.status==='read'?'Mark unread':'Mark read');card.appendChild(read);
          read.addEventListener('click',function(){read.disabled=true;json(api+'/messages/'+encodeURIComponent(message.id),{method:'PUT',headers:{Authorization:'Bearer '+token,'Content-Type':'application/json'},body:JSON.stringify({status:message.status==='read'?'new':'read'})}).then(load).catch(function(e){note.textContent=e.message;read.disabled=false;});});
          list.appendChild(card);
        });
        previous.disabled=page<=1;next.disabled=page>=pages;
      }).catch(function(e){note.textContent=e.message;}).finally(function(){refresh.disabled=false;});
    }
    previous.addEventListener('click',function(){if(page>1){page--;load();}});next.addEventListener('click',function(){if(page<pages){page++;load();}});refresh.addEventListener('click',load);load();
  }
  function run(){
    enhanceContact();renderInbox();
    if(location.pathname.indexOf('/admin')===0&&location.pathname!=='/admin/login'&&location.pathname!=='/admin/messages'){
      var heading=document.querySelector('#root h1');
      if(heading&&!document.getElementById('ftw-inbox-link')){var link=text('a','Support inbox');link.id='ftw-inbox-link';link.href='/admin/messages';heading.insertAdjacentElement('afterend',link);}
    }
  }
  var scheduled=false;new MutationObserver(function(){if(scheduled)return;scheduled=true;requestAnimationFrame(function(){scheduled=false;run();});}).observe(document.documentElement,{childList:true,subtree:true});
  document.addEventListener('DOMContentLoaded',run);run();
}());
