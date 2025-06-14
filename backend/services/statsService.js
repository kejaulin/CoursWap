const OneToOneEvent = require('../models/OneToOneEvent');

exports.getProfStats = async () => {
  return await OneToOneEvent.mapReduce({
    map: function () {
      emit(this.profId.toString(), 1);
    },
    reduce: function (key, values) {
      return Array.sum(values);
    },
    out: { inline: 1 }
  });
};

exports.getEtudiantStats = async () => {
  return await OneToOneEvent.mapReduce({
    map: function () {
      emit(this.etudiantId.toString(), 1);
    },
    reduce: function (key, values) {
      return Array.sum(values);
    },
    out: { inline: 1 }
  });
};
