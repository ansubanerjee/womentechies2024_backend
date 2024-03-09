const { expressjwt: jwt } = require("express-jwt");

function authJwt(){
    const secret = process.env.secret;
    const api = process.env.API_URL;
    return jwt({
        secret,
        algorithms: ['HS256'],
        isRevoked: isRevoked
    }).unless({
        path: [
            `${api}/users/login`,
            `${api}/users/register`,
            `${api}/womens/login`,
            `${api}/womens/register`,
            `${api}/courses/`,
            `${api}/posts/`,
            `${api}/products/`,
            
        ]
    })
}

async function isRevoked(req, token){
    if(!token.payload.isAdmin) {
       return true;
    }
}

module.exports = authJwt;