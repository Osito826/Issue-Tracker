'use strict';
let mongodb = require('mongodb');
let mongoose = require('mongoose');

//Create a Schema defining info each issue/project will store
let issueSchema = new mongoose.Schema({
  project: String,
  issue_title: { type: String, required: true },
  issue_text: { type: String, required: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, default: "" },
  status_text: { type: String, default: "" },
  open: { type: Boolean, default: true },
  created_on: { type: Date, default: "" },
  updated_on: { type: Date, default: "" },
})
//Create a model for Issue using the schema
const Issue = mongoose.model('Issue', issueSchema);
//Connect to Database
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

module.exports = function(app) {

  app.route('/api/issues/:project')

    .get(async function(req, res) {
      try {
        let project = req.params.project;
        let filterObject = Object.assign(req.query)

        filterObject['project'] = project
        const foundIssue = await Issue.find(filterObject);
        res.json(foundIssue)
      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    })
    .post(async function(req, res) {
      //new mongoose version 7:save() does not take a callback
      try {
        let project = req.params.project

        if (!req.body.issue_title || !req.body.issue_text || !req.body.created_by) {
          return res.json({ error: 'required field(s) missing' })
        }
        const newIssue = await Issue.create({
          project: project,
          issue_title: req.body.issue_title,
          issue_text: req.body.issue_text,
          created_by: req.body.created_by,
          assigned_to: req.body.assigned_to || '',
          status_text: req.body.status_text || '',
          created_on: new Date().toUTCString(),
          updated_on: new Date().toUTCString(),
          open: true
        })
        return res.json(newIssue);
      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    })
    .put(async function(req, res) {
      try {
        //let project = req.params.project;
        if (!req.body._id) {
          res.json({ error: "missing _id" })
          return;
        }
        let updates = {}
        Object.keys(req.body).forEach((key) => {
          //only taking keys that is needed to do an update
          if (req.body[key] != '') {
            updates[key] = req.body[key];
          }
        })
        //console.log(updates);
        if (Object.keys(updates).length < 2) {
          return res.json({ error: "no update field(s) sent", '_id': req.body._id })
        }

        updates['updated_on'] = new Date()//.toUTCString()
        const issueUpdated = await Issue.findByIdAndUpdate(req.body._id, {
          $set: updates
        }).exec();

        if (!issueUpdated) {
          return res.json({ error: 'could not update', '_id': req.body._id });
        } else {
          return res.send({ result: 'successfully updated', '_id': req.body._id });
        }
      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    })
    .delete(async function(req, res) {
      //let project = req.params.project;
      try {
        let obj = Object.assign(req.body)
        //const { _id } = req.body;
        if (!req.body._id) {
          return res.json({ error: 'missing _id' })
        }

        let deleteIssue = await Issue.findByIdAndDelete(obj._id).exec();

        if (!deleteIssue) {
          return res.json({ error: 'could not delete', '_id': req.body._id })
        } else {
          return res.json({ result: 'successfully deleted', '_id': req.body._id })
        }
      } catch (err) {
        console.error(err);
        res.status(200).send(err);
      }
    });
};
