// import http from 'k6/http';
// import { check, sleep } from 'k6';

// export const options = {
//   vus: 20,
//   duration: '20s',
// };

// export default function () {
//   // Login first to get cookie
//   const loginRes = http.post('http://localhost:4000/api/v1/auth/login', JSON.stringify({
//     email: 'ritesh@gmail.com',
//     password: '12345678',
//   }), {
//     headers: { 'Content-Type': 'application/json' },
//   });

//   const cookies = loginRes.headers['Set-Cookie'];
  
//   // Use cookie for customer request
//   const res = http.get('http://localhost:4000/api/v1/customer', {
//     headers: {
//       'Cookie': cookies,
//     },
//   });

//   check(res, {
//     'status is 200': (r) => r.status === 200,
//     'response time < 500ms': (r) => r.timings.duration < 500,
//   });

//   sleep(1);
// }


import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '20s',
};

let cookies;

export function setup() {
  const res = http.post('http://localhost:4000/api/v1/auth/login', JSON.stringify({
    email: 'ritesh@gmail.com',
    password: '12345678',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });
  return { cookies: res.headers['Set-Cookie'] };
}

export default function (data) {
  const res = http.get('http://localhost:4000/api/v1/customer', {
    headers: { 'Cookie': data.cookies },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 300ms': (r) => r.timings.duration < 300,
  });

  sleep(0.1);
}