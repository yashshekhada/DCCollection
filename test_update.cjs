const http = require('http');

const data = JSON.stringify({
  name: "Crop-top Updated",
  description: "",
  price: 0,
  image_url: "",
  category: "Crop-Top",
  stock: 0,
  design_code: "10",
  is_on_sale: false,
  sale_price: null,
  variants: [
    {
      color_name: "Green",
      color_hex: "#0f4810",
      size: "M",
      extra_price: 0,
      media: [{ url: "http://example.com/green.jpg", type: "image" }]
    }
  ]
});

const req = http.request({
  hostname: 'localhost',
  port: 3000,
  path: '/api/products/16',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
}, (res) => {
  let d = '';
  res.on('data', chunk => { d += chunk; });
  res.on('end', () => { console.log("PUT Response:", d); });
});

req.write(data);
req.end();
