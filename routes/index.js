var express = require('express');
var router = express.Router();
const scrapper = require('../test');
// const data = require('../file')
const Profile = require('../models/profileModel');

router.get("/", (req, res) => {
  res.send("server is running")
})

/* GET home page. */
// router.get("/profiles", async (req, res) => {
//   const data = await Profile.find({});
//   res.send({ data })
// });

// router.post("/scrape", async (req, res) => {
//   const query = req.body.query;
//   const response = await scrapper(query);
//   const data = await Profile(response)
//   data.save();
// });

router.post("/profiles", async (req, res) => {
  const query = req.body;
  console.log(query)
  const dbData = await Profile.find({});
  // res.send({dbData: dbData.length});
  const data = await scrapper(query, dbData);
  let count = 0;
  data.forEach(async(item) => {
    const newData = await Profile(item);
    newData.save().then(() => { count++ })
  })
  // return res.send({ data });
  // const newData = await Profile(data);
  Profile.insertMany(data).then(() => res.send({ message: `Scrapped count: ${data.length}` })).catch(err => res.send(err))
})

router.get("/view/:profileId", async (req, res) => {
  const profileId = req.params.profileId;
  const profileData = await Profile.findOne({ position: profileId })
  res.send({ profileData });
})

router.get('/test', async function (req, res, next) {
  const data = await Profile.find({})
  res.send({ data });
});


module.exports = router;
