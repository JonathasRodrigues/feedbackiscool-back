'use strict';

module.exports = function(School) {
  School.observe('loaded', function(ctx, next) {
    if (ctx.data) {
      var gp = 0;
      var lp = 0;
      var sp = 0;
      var staffp = 0;
      var tmp = 0;
      var tp = 0;
      var mx = 0;
      var recommend = 0;
      var noRecommend = 0;
      School.app.models.Review.find({
        where: {
          schoolId: ctx.data.id,
        },
        fields: {
          generalPoints: true,
          localizationPoints: true,
          structurePoints: true,
          staffPoints: true,
          teachingMethodPoints: true,
          teachersPoints: true,
          recommend: true,
          mixNacionalityPoints: true,
        },
      }, function(err, reviews) {
        if (err) return next(err);
        if (reviews && reviews.length) {
          reviews.forEach(function(review) {
            gp += review.generalPoints;
            lp += review.localizationPoints;
            sp += review.structurePoints;
            staffp += review.staffPoints;
            tmp += review.teachingMethodPoints;
            tp += review.teachersPoints;
            mx += review.mixNacionalityPoints;
            if (review.recommend) {
              recommend = recommend + 1;
            } else {
              noRecommend = noRecommend + 1;
            };
          });
          const rs = reviews ? reviews.length : 0;
          ctx.data.generalPoints =
          (Math.round((gp / rs) / 0.5) * 0.5).toFixed(2);
          ctx.data.localizationPoints =
          (Math.round((lp / rs) / 0.5) * 0.5).toFixed(2);
          ctx.data.structurePoints =
          (Math.round((sp / rs) / 0.5) * 0.5).toFixed(2);
          ctx.data.staffPoints =
          (Math.round((staffp / rs) / 0.5) * 0.5).toFixed(2);
          ctx.data.teachingMethodPoints =
          (Math.round((tmp / rs) / 0.5) * 0.5).toFixed(2);
          ctx.data.teachersPoints =
          (Math.round((tp / rs) / 0.5) * 0.5).toFixed(2);
          ctx.data.mixNacionality =
          (Math.round((mx / rs) / 0.5) * 0.5).toFixed(2);
          ctx.data.reviews = reviews.length;
          ctx.data.recommend = recommend;
          ctx.data.noRecommend = noRecommend;
        }
        return next();
      });
    } else {
      return next();
    }
  });
};
