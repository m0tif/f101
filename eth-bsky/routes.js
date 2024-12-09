const domains = [
  "eth-bsky.app",
  "eth.band",
  "eth.br.com",
  "eth.cn.com",
  "eth.co.bz",
  "eth.com.im",
  "eth.furniture",
  "eth.gr.com",
  "eth.hu.net",
  "eth.net.im",
  "eth.net.pe",
  "eth.net.ph",
  "eth.net.vc",
  "eth.org.im",
  "eth.org.mx",
  "eth.org.pe",
  "eth.org.ph",
  "eth.org.vc",
];

/// return a sequence of records [domain, pattern]
module.exports = () => {
  const out = [];
  for (const addr of domains) {
    out.push(`*.${addr}/*`);
    out.push(`${addr}/*`);
  }
  return out;
};
