import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 3,
  duration: '15s',
};

const customerId = 'cmrk9cs250063140nkfg8k2af';
const serviceId = 'cmrkagmtn00046nkpwnf42yxc';

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
  const phone = String(__VU) + String(__ITER) + String(Date.now()).slice(-5);
  
  const payload = JSON.stringify({
    customerId: customerId,
    notes: 'TEST_Performance',
    items: [
      {
        serviceId: serviceId,
        description: `Test ${phone}`,
        quantity: 1,
        unitPrice: 1000,
      },
    ],
  });

  const headers = {
    'Content-Type': 'application/json',
  };

  if (data.cookies) {
    const cookieString = Array.isArray(data.cookies) ? data.cookies.join('; ') : data.cookies;
    headers['Cookie'] = cookieString;
  }

  const res = http.post('http://localhost:4000/api/v1/quotation', payload, { headers });

  check(res, {
    'API responds': (r) => r.status === 201 || r.status === 409,
    'response time < 1500ms': (r) => r.timings.duration < 1500,
  });

  sleep(1);
}