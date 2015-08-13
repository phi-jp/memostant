

;(function() {

  var BASE_PATH = 'http://memostant-server.herokuapp.com';
  var BASE_PATH = 'http://0.0.0.0:8000';

  var api = {
    ajax: function(params) {
      params.crossDomain = true;
      params.url = [BASE_PATH, params.url].join('/');
      params.beforeSend = function(xhr) {
        xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('id_token'));
      };
      var a = $.ajax(params)
      a.done(function(data) {
        console.dir(data);
      });

      return a;
    },

    me: function() {
      return api.ajax({
        url: 'me',
        method: 'GET',
      });
    },

    users: {
      create: function(data) {
        return api.ajax({
          url: 'users',
          method: 'POST',
          data: data,
        });
      },
      update: function(id, data) {
        return api.ajax({
          url: 'users/' + id,
          method: 'PUT',
          data: data,
        });
      },
    },

    notes: {
      index: function() {
        return api.ajax({
          url: 'notes',
          method: 'GET',
        });
      },
      show: function(id) {
        return api.ajax({
          url: 'notes/' + id,
          method: 'GET',
        });
      },
      create: function(data) {
        return api.ajax({
          url: 'notes',
          method: 'POST',
          data: data,
        });
      },
      update: function(id, data) {
        return api.ajax({
          url: 'notes/' + id,
          method: 'PUT',
          data: data,
        });
      },
      destroy: function(id) {
        return api.ajax({
          url: 'notes/' + id,
          method: 'DELETE',
        });
      },
    }
  };

  window.api = api;
  window.global = window;

})();