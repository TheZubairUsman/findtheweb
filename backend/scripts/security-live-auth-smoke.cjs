// Read-only production verification. The short-lived token stays in this
// process and is never printed, persisted, or sent outside the backend host.
const jwt = require('jsonwebtoken');
const { sequelize, Admin } = require('../src/models');
(async()=>{
  const admin=await Admin.findOne({where:{isActive:true},attributes:['id']});
  if(!admin)throw new Error('No active admin available for read-only verification');
  const token=jwt.sign({id:admin.id,role:'admin',isAdmin:true},process.env.JWT_SECRET,{expiresIn:'60s',issuer:process.env.JWT_ISSUER||'findtheweb-admin',audience:process.env.JWT_AUDIENCE||'findtheweb-admin-ui'});
  const result=[];
  for(const endpoint of ['/api/v1/admin/posts?limit=1','/api/v1/contact/messages?page=1']) {
    const response=await fetch('http://127.0.0.1:5000'+endpoint,{headers:{Authorization:'Bearer '+token}});
    const payload=await response.json();
    if(!response.ok||!payload.success)throw new Error('Authenticated read failed: '+endpoint+' '+response.status);
    result.push({endpoint,status:response.status});
  }
  console.log(JSON.stringify({authenticatedReadOnlyChecks:result}));
})().then(()=>sequelize.close()).catch(async error=>{console.error(error.message);await sequelize.close();process.exitCode=1;});
