const functions = require('firebase-functions');
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const pointInPolygon = require('point-in-polygon');

const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();

const potholeApp = express();
const malaysianDistrictGeoJson = JSON.parse(fs.readFileSync(__dirname + '/../utilities/malaysia.districts.geojson', 'utf-8'));

/**
 *
 * @param {number} lat
 * @param {number} lon
 * @return {string} A district name
 */
function getDistrictFromLatLon(lat, lon) {
  let polygonFound = false;

  for (const feature of malaysianDistrictGeoJson.features) {
    polygonFound = pointInPolygon([lon, lat], feature.geometry.coordinates[0][0]);
    if (polygonFound) {
      return `${feature.properties.NAME_2} / ${feature.properties.NAME_1}`;
    }
  }

  return 'Unknown';
}

potholeApp.use(cors({ origin: true }));

potholeApp.get('/', async (req, res) => {
  const snapshot = await db.collection('potholes').get();

  const potholes = [];
  snapshot.forEach((doc) => {
    const id = doc.id;
    const data = doc.data();

    potholes.push({ id, ...data });
  });

  res.status(200).send(potholes);
});

potholeApp.get('/:id', async (req, res) => {
  const snapshot = await db.collection('potholes')
      .doc(req.params.id).get();

  const potholeId = snapshot.id;
  const potholeData = snapshot.data();

  res.status(200).send({ id: potholeId, ...potholeData });
});

potholeApp.post('/', async (req, res) => {
  const pothole = req.body;

  const areaName = getDistrictFromLatLon(pothole.lat, pothole.lon);
  pothole.area = areaName;

  await db.collection('potholes').add(pothole);

  res.status(201).send();
});

potholeApp.put('/:id', async (req, res) => {
  const body = req.body;

  await db.collection('potholes').doc(req.params.id).update(body);

  res.status(200).send();
});

potholeApp.delete('/:id', async (req, res) => {
  await admin.firestore().collection('potholes').doc(req.params.id).delete();

  res.status(200).send();
});

exports.pothole = functions.region('asia-southeast1').https.onRequest(potholeApp);
