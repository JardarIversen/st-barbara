import fs from 'node:fs/promises';
import sharp from 'sharp';
import React from 'react';
import { ImageResponse } from 'next/og.js';

// Keep the legacy ICO endpoint in sync with the SVG used by modern browsers.
const png = await sharp('src/app/icon.svg').resize(64, 64).png().toBuffer();
const header = Buffer.alloc(22);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(1, 4);
header[6] = 64;
header[7] = 64;
header.writeUInt16LE(1, 10);
header.writeUInt16LE(32, 12);
header.writeUInt32LE(png.length, 14);
header.writeUInt32LE(22, 18);
await fs.writeFile('src/app/favicon.ico', Buffer.concat([header, png]));

const photo = await fs.readFile('public/images/kirken-eksterior.jpg');
const h = React.createElement;
const response = new ImageResponse(
  h('div', {style: {display:'flex', width:'100%', height:'100%', background:'#6e2233', color:'#ffffff'}},
    h('div', {style:{display:'flex', flexDirection:'column', justifyContent:'center', width:510, padding:54}},
      h('svg', {width:48, height:64, viewBox:'0 0 48 64', style:{marginBottom:28}},
        h('path', {d:'M24 4V60M6 22H42', stroke:'#c8ae7c', strokeWidth:5}),
      ),
      h('div', {style:{fontSize:56, lineHeight:1.1, fontWeight:700}}, 'St. Barbara'),
      h('div', {style:{fontSize:38, marginTop:8}}, 'menighet'),
      h('div', {style:{fontSize:24, marginTop:32, color:'#f1e8db'}}, 'Den katolske kirke i Kongsberg'),
      h('div', {style:{fontSize:20, marginTop:40, color:'#c8ae7c'}}, 'kongsberg.katolsk.no'),
    ),
    h('img', {src:`data:image/jpeg;base64,${photo.toString('base64')}`, width:690, height:630, style:{objectFit:'cover'}}),
  ), {width:1200, height:630},
);
await fs.writeFile('public/parish-share.png', Buffer.from(await response.arrayBuffer()));
