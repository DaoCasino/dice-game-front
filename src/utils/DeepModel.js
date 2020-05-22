import Backbone from 'backbone'
import _ from 'underscore'

const DeepModel = Backbone.Model.extend({
  get: function(attr) {
    return _.clone(Backbone.Model.prototype.get.apply(this, arguments))
  },
})

export default DeepModel