import fs from 'fs';
import FormData from 'form-data';
import fetch from 'node-fetch';

async function testUpload() {
  const form = new FormData();
  // Create a dummy file
  fs.writeFileSync('dummy.jpg', 'fake image content');
  form.append('file', fs.createReadStream('dummy.jpg'));

  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form
    });
    console.log('Status:', res.status);
    const text = await res.text();
    console.log('Response:', text);
  } catch (e) {
    console.error(e);
  } finally {
    fs.unlinkSync('dummy.jpg');
  }
}

testUpload();
