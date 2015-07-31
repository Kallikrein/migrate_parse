/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

 var fs = require('fs');
 var _  = require('lodash');

module.exports.bootstrap = function(cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)

  (function() {
    var LocalQuestion = JSON.parse(fs.readFileSync('assets/import/cleanLocalQuestion.json'));
    var Series = JSON.parse(fs.readFileSync('assets/import/cleanSeries.json'));

    var contents = [];
    var scenarios = [];

    _.map(LocalQuestion, function (content) {
      contents.push(parseRecord(content));
    });

    _.map(Series, function (serie) {
      scenarios.push(parseSerie(serie));
    });

    function parseRecord(record) {
      var temp = {};

      temp = _.pick(record, ['type', 'objectId', 'createdAt', 'updatedAt']);
      temp.obj = JSON.stringify(_.omit(record, ['type', 'objectId', 'createdAt', 'updatedAt']));

      return temp;
    };


    function parseSerie(serie) {
      var temp = {};

      temp = _.pick(serie, ['objectId', 'createdAt', 'updatedAt']);

      temp.slots = _.pluck(serie.slots, 'objectId');

      return temp;
    };

    ParseContent.create(contents)
    .then(function (res) {
      return ParseScenario.create(_.map(scenarios, function (scenario) {
        return _.omit(scenario, 'slots');
      }))
    })
    .then(function (res) {
      return ParseScenario.find().populateAll();
    })
    .then(function (res) {
      _.map(res, function (scn) {
        var slots = _.find(scenarios, {objectId: scn.objectId}).slots
        _.map(slots, function (slot) {
          ParseContent.findOne({objectId: slot})
          .then(function (res) {
            scn.contents.add(res.id)
            scn.save();
          })
        })
      })
    })

  })()

  cb();
};
