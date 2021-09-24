const { Schema, model } = require('mongoose');

const profileSchema = Schema({
  position: String,
  name: String,
  exp: String,
  salary: String,
  location: String,
  current: String,
  previous: String,
  education: String,
  prefLoc: String,
  skills: String,
  alsoKnows: String,
  active: String,
  modified: String,
  headLine: String,
  views: String,
  downloads: String,
  description: String,
  workSummary: String,
  workExp: String,
  cnt: Number,
  other: {
    desiredJobDetails: { jobType: String, jobStatus: String },
    workAuthorization: { usStatus: String, otherCountries: String }
  },
  personalDetails: {
    dob: String,
    gender: String,
    maritalStatus: String,
    category: String,
    address: String,
    contact: String,
    email: String
  },
  key: String,
  resume: String,
  isFullyScrapped: { type: Boolean, default: false }
});

module.exports = model("Profile", profileSchema)