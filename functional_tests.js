const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let id1 = "";
let id2 = "";


suite('Functional Tests', function() {
  test("Issue with every field", function(done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title",
        issue_text: "Text",
        created_by: "Every field filled in",
        assigned_to: "FCC",
        status_text: "In QA"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Title");
        assert.equal(res.body.issue_text, "Text");
        assert.equal(
          res.body.created_by,
          "Every field filled in"
        );
        assert.equal(res.body.assigned_to, "FCC");
        assert.equal(res.body.status_text, "In QA");
        assert.equal(res.body.project, "test");
        id1 = res.body._id;
        console.log("id 1 has been set as " + id1);
        done();
      });
  });

  test("Issue with only required fields", function(done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title 2",
        issue_text: "Text",
        created_by: "Required fields filled in"
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, "Title 2");
        assert.equal(res.body.issue_text, "Text");
        assert.equal(
          res.body.created_by,
          "Required fields filled in"
        );
        assert.equal(res.body.assigned_to, "");
        assert.equal(res.body.status_text, "");
        assert.equal(res.body.project, "test");
        id2 = res.body._id;
        console.log("id 2 has been set as " + id2);
        done();
      })
  });

  test("Issue with missing required fields", function(done) {
    chai
      .request(server)
      .post("/api/issues/test")
      .send({
        issue_title: "Title"
      })
      .end(function(err, res) {
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  test("View issues on a project", function(done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        assert.property(res.body[0], "issue_title");
        assert.property(res.body[0], "issue_text");
        assert.property(res.body[0], "created_on");
        assert.property(res.body[0], "updated_on");
        assert.property(res.body[0], "created_by");
        assert.property(res.body[0], "assigned_to");
        assert.property(res.body[0], "open");
        assert.property(res.body[0], "status_text");
        assert.property(res.body[0], "_id");
        done();
      });
  });

  test("View issues on a project with one filter", function(done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({ created_by: "project with one filter" })
      .end(function(err, res) {
        res.body.forEach(issueReturn => {
          assert.equal(
            issueReturn.created_by,
            "project with one filter"
          );
        });
        done();
      });
  });

  test("View issues on a project with multiple filters", function(done) {
    chai
      .request(server)
      .get("/api/issues/test")
      .query({
        open: true,
        created_by: "project with multiple filters"
      })
      .end(function(err, res) {
        res.body.forEach(issueResult => {
          assert.equal(issueResult.open, true);
          assert.equal(
            issueResult.created_by,
            "project with multiple filters"
          );
        });
        done();
      });
  });

  test("Update one field on an issue", function(done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: id1,
        issue_text: "new text"
      })
      .end(function(err, res) {
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });

  test("Update multiple fields on an issue", function(done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: id2,
        issue_title: "new title",
        issue_text: "new text"
      })
      .end(function(err, res) {
        assert.equal(res.body.result, "successfully updated");
        done();
      });
  });

  test("Update an issue with missing _id", function(done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({})
      .end(function(err, res) {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

  test("Update an issue with no fields to update", function(done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({
        _id: id1,
        issue_title: "",
        issue_text: "",
        created_by: "",
        assigned_to: "",
        status_text: ""
      })
      .end(function(err, res) {
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  });

  test("Update an issue with an invalid _id", function(done) {
    chai
      .request(server)
      .put("/api/issues/test")
      .send({ _id: id1 })
      .end(function(err, res) {
        assert.equal(res.body.error, "no update field(s) sent");
        done();
      });
  })

  test("Delete an issue", function(done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: id1
      })
      .end(function(err, res) {
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, id1);
      });
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: id2
      })
      .end(function(err, res) {
        assert.equal(res.body.result, "successfully deleted");
        assert.equal(res.body._id, id2);
        done();
      });
  });


  test("Delete an issue with an invalid _id", function(done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: id1
      })
      .end(function(err, res) {
        assert.equal(res.body.error, "could not delete");
      });
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({
        _id: id2
      })
      .end(function(err, res) {
        assert.equal(res.body.error, "could not delete");
        done();
      });
  });

  test("Delete an issue with missing _id", function(done) {
    chai
      .request(server)
      .delete("/api/issues/test")
      .send({})
      .end(function(err, res) {
        assert.equal(res.body.error, "missing _id");
        done();
      });
  });

});
