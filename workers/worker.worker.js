self.onmessage = (e) => {
  console.log('Worker received:', e.data);
  self.postMessage('Hello from Worker 👋');
};
