var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/scribe';

MongoClient.connect(url, function (err, db) {
  if (err)  return console.error(err);

  var Entry = db.collection('entries');
  var cursor = Entry.find({serialized: {$exists: false}});

  cursor.on('data', function (doc) {
    if (doc.serialized) {
      return cursor.resume();
    }

    cursor.pause();

    Entry.update({_id: doc._id},
                 {$set: {serialized: JSON.stringify(doc)}},
                 err => {
                   if (err) {
                     console.error(err);
                     cursor.close();
                     return;
                   }

                   cursor.resume();
                 });
  });

  cursor.on('error', function (err) {
    console.error(err);

    process.exit(1);
  });

  cursor.on('end', function () {
    db.close();

    console.log('Finished. Exiting...');
    process.exit(0);
  });
});