import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 5,
  duration: '10s',
};

let globalCounter = 0;

export function setup() {
  const res = http.post('http://localhost:4000/api/v1/auth/login', JSON.stringify({
    email: 'ritesh@gmail.com',
    password: '12345678',
  }), {
    headers: { 'Content-Type': 'application/json' },
  });

  const cookies = res.headers['Set-Cookie'];
  return { cookies: cookies };
}

export default function (data) {
  sleep(Math.random() * 0.5);
  
  const email = generateUniqueEmail(__VU, __ITER);
   globalCounter++;
  
  const phone = String(__VU) + 
                String(globalCounter).padStart(9, '0');

  
  const payload = JSON.stringify({
    name: `Perf Test ${phone}`,
    email: email,
    phone: phone,
    notes: 'TEST_Performance',
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  if (data.cookies) {
    const cookieString = Array.isArray(data.cookies) ? data.cookies.join('; ') : data.cookies;
    headers['Cookie'] = cookieString;
  }

  const res = http.post('http://localhost:4000/api/v1/customer', payload, { headers });

  if (res.status !== 201) {
    const body = JSON.parse(res.body);
    console.log(`FAIL - Status: ${res.status}, Message: ${body.message}, Phone: ${phone}, Email: ${email}`);
  }

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 800ms': (r) => r.timings.duration < 800,
  });

  check(res, {
  'API responds': (r) => r.status === 201 || r.status === 409,
  'response time < 1200ms': (r) => r.timings.duration < 1200,
})

  sleep(0.5);
}

function generateUniquePhone(vu, iter) {
  const random = Math.floor(Math.random() * 90000) + 10000;
  const timePart = Date.now() % 100;
  
  const phone = String(vu) + 
                String(iter % 100).padStart(2, '0') + 
                String(random) + 
                String(timePart).padStart(2, '0');
  
  return phone.slice(0, 10);
}

function generateUniqueEmail(vu, iter) {
  const random = Math.floor(Math.random() * 90000) + 10000;
  const timePart = Date.now() % 100;
  
  const uniqueId = String(vu) + 
                   String(iter % 100).padStart(2, '0') + 
                   String(random) + 
                   String(timePart).padStart(2, '0');
  
  return `vfg-${uniqueId.slice(0, 10)}@test.com`;
}