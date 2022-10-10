const request = require('request');
const HOST = 'http://api.weixin.qq.com';

/**
 * 云托管环境的 urlScheme 获取
 */
exports.getLink = (req, res)=>{
  try{
    const OPENID = req.headers['x-wx-openid'];
    const UNIONID = req.headers['x-wx-unionid'];
    const token = req.headers['x-wx-cloudbase-access-token'];
    const appid = req.headers['x-wx-appid'];
    const localDebug = req.headers['x-wx-local-debug'];

    const opt = req.body;

    let rtd = (opt.useOpenid) ? {OPENID, UNIONID } : {}

    let data = opt.cat == 'check' ? null : opt.data
    if(opt.cat == 'check'){
      rtd.errCode = 0;
      return res.json(rtd);
    }

    // 根据文档说明，其实可以直接用 token，资源复用情况下的 token 已经是调用方的了，为保险起见，附加了调用方的 appid。
    let mixedToken = appid + '@' + token;

    /**
     * 这段代码是本地调试用的.
     * 因本地调试开启了 api.weixin.qq.com 代理，导致 headers 里面的 'x-wx-appid' 始终是资源拥有方的 appid
     * 见官方文档 https://developers.weixin.qq.com/miniprogram/dev/wxcloudrun/src/guide/debug/
     * 使用限制 5. 本地调试中获得的 x-wx-openid 不包含用户身份，仅能用于部分小程序接口，和线上获取的用户真实 openid 不一致。如需调试微信支付等依赖真实 openid 的功能，请手动改用成开发者自己的真实openid，不要直接使用本地调试中从 header 直接获取的openid。
     */
    // if(localDebug){
    //   mixedToken = '云环境appId@'+token
    // }

    generatescheme(data, mixedToken).then(rt=>{
      rtd.errCode = 0;
      rtd.openlink = rt.openlink, 
      res.json(rtd);
    }).catch(ex=>{
      rtd.errCode = ex.errcode;
      rtd.errMsg = ex.errmsg;
      res.json(rtd);
    });
  }catch(ex){
    res.json({errCode:-1, errMsg:ex})
  }
}

/**
 * 获取小程序 scheme 码
 * @param {Object} data 参数 见 https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html
 * @param {String} token 资源复用情况下必须提供
 */
 const generatescheme = (data, token)=>{
  let opt={
    url: `${HOST}/wxa/generatescheme` + (token ? '?cloudbase_access_token='+token : ''),
    method: 'POST',
    body: data ? JSON.stringify(data): ''
  }
  return _doCall(opt);
}

function isString(value) {
  const type = typeof value
  return type === 'string' || (type === 'object' && value != null && !Array.isArray(value) && getTag(value) == '[object String]')
}

const _doCall = (opt)=>{
  return new Promise((resolve, reject) => {
    try {
      request(opt, (err,resp)=>{
        if(err){
          return reject && reject(err);
        }
        let rt = resp.body;
        if(rt && isString(rt)){
          rt = JSON.parse(rt);
        }
        if(rt && rt.errcode === 0){
          return resolve && resolve(rt)
        }else{
          return reject && reject(rt);
        }
      })
    } catch(ex) {
      return reject && reject(ex);
    }
  });
}