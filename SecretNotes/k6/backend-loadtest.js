import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '10s',
  thresholds: {
    http_req_failed: ['rate<0.01'],
    http_req_duration: ['p(95)<500'],
  },
};

const baseUrl = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  const health = http.get(`${baseUrl}/health`);
  check(health, {
    'health returns 200': (res) => res.status === 200,
  });

  const notes = http.get(`${baseUrl}/notes`);
  check(notes, {
    'notes returns 200': (res) => res.status === 200,
  });

  sleep(1);
}
