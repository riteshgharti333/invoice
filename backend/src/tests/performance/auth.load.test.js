import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 10, // 10 virtual users
  duration: '30s', // Run for 30 seconds
};

export default function () {
  const url = 'http://localhost:4000/api/v1/auth/login';
  const payload = JSON.stringify({
    email: 'ritesh@gmail.com',
    password: '12345678',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(url, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 2000ms': (r) => r.timing.duration < 2000,
  });

  sleep(1);
}