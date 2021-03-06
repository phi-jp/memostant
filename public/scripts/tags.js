
riot.tag('app', '<header></header> <content></content>', function(opts) {
    window.lock = new Auth0Lock('OkDgBFuMfTt6iKz0fLQ1IAUm9zftz9TW', 'phi.auth0.com');
    var self = this;
    
    var hash = lock.parseHash(window.location.hash);
    if (hash && hash.id_token) {
      localStorage.setItem('id_token', hash.id_token);
      location.hash = '';
    }
    
    this.on('mount', function() {
      riot.route.start();
    
      riot.route.parser(function(path) {
        var raw = path.split('?');
        var hashes = raw[0].split('/');
        var qs = raw[1];
        var params = {};
    
        if (qs) {
          qs.split('&').forEach(function(v) {
            var c = v.split('=');
            params[c[0]] = c[1];
          });
        }
    
        return [hashes, params];
      });
    
      riot.route(function(path, query) {
        var tag = path[0];
    
        if (localStorage.getItem('id_token') && !global.me) {
          api.me()
            .done(function(res) {
              if (res.user) {
                global.me = res.user;
                riot.mountTo('content', tag);
                self.tags.header.update();
              }
              else {
                history.pushState(null, null, '/#setting');
                riot.mountTo('content', 'setting');
              }
            });
        }
        else {
          riot.mountTo('content', tag);
          self.tags.header.update();
        }
      });
    
      var hash = location.hash.replace('#', '');
      riot.route(hash || 'home');
    });
  
});

riot.tag('home', '<div class="container"> <h2>home</h2> <ul class="collection"> <li each="{notes}" class="collection-item"><span class="title">{title}</span> <p>{content}<span>by {_creator.name}</span></p><span>{parent.created(this)} / {parent.updated(this)}</span> <button onclick="{destroy}">destroy</button> <button onclick="{edit}">edit</button> </li> </ul> </div>', function(opts) {
    var self = this;
    this.fetch = function() {

      api.notes.index()
        .done(function(res) {
          self.notes = res.notes;
          self.update();
        });
    };
    this.fetch();
  
});

riot.tag('note', '<h2>user</h2> <form name="mainForm" onsubmit="{submit}"> <input name="title"> <textarea name="content"> </textarea> <button>submit</button> </form>', function(opts) {
    var self = this;
    var id = null;
    
    riot.route.exec(function(path, query) {
      id = path[1];
    });
    
    api.notes.show(id)
      .done(function(data) {
        var elements = self.mainForm.elements;
        elements.title.value = data.note.title;
        elements.content.value = data.note.content;
        self.update();
      });
    
    this.submit = function() {
      var elements = self.mainForm.elements;
      var data = {
        title: elements.title.value,
        content: elements.content.value,
      };

      api.notes.update(id, data)
        .done(function(res) {
        });
    };
  
});

riot.tag('setting', '<div class="container"> <h2>setting</h2> <form name="mainForm" onsubmit="{submit}"> <input name="name" type="text" placeHolder="name"> <textarea name="description" placeHolder="description"></textarea> <button>submit</button> </form> </div>', function(opts) {
    this.mainForm.name.value = global.me.name;
    this.mainForm.description.value = global.me.description;
    
    this.submit = function() {
      var form = this.mainForm;
      var data = {
        name: form.name.value,
        description: form.description.value,
      };
    
      if (global.me) {
        api.users.update(global.me._id, data);
      }
      else {
        api.users.create(data);
      }
    };
  
});

riot.tag('user', '<div class="container"> <h2>{user.name} のページ</h2> <p>{user.description}</p><a href="#setting" class="btn">setting</a> <button onclick="{create}" class="btn">create</button> <ul class="collection"> <li each="{notes}" class="collection-item"><span class="title">{title}</span> <p>{content}<span>by {_creator.name}</span></p><span>{parent.created(this)} / {parent.updated(this)}</span> <button onclick="{destroy}">destroy</button> <button onclick="{edit}">edit</button> </li> </ul> </div>', function(opts) {
    var self = this;
    
    this.on('mount', function() {
      var name = '';
      riot.route.exec(function(path) {
        name = path[1];
      });
      api.users.show(name)
        .done(function(data) {
          self.user = data.user;
          self.fetch();
        });
    });
    
    this.fetch = function() {

      api.notes.index({userId:self.user._id})
        .done(function(res) {
          self.notes = res.notes.reverse();
          self.update();
        });
    };
    
    this.create = function() {
      var data = {
        title: 'untitled',
        content: 'ここにテキスト書いてってねー♪',
      }; 
      api.notes.create(data)
        .done(function() {
          self.fetch();
        });
    };
    
    this.edit = function(e) {
      var item = e.item;
      if (item._creator._id === global.me._id) {
        var path = ['note', item._id].join('/');
        riot.route(path);
      }
    };
    
    this.destroy = function(e) {
      var item = e.item;
      api.notes.destroy(item._id)
        .done(function() {
          self.fetch();
        });
    };
    
    this.created = function(item) {
      var date = new Date(item.created);
      return [date.getHours(), date.getMinutes()].join(':');
    };
    this.updated = function(item) {
      var date = new Date(item.updated);
      return [date.getHours(), date.getMinutes()].join(':');
    };
  
});

riot.tag('header', '<nav> <div class="nav-wrapper"> <div class="brand-logo"><a href="">Memostant</a></div> <ul if="{!isLogin}" class="right"> <li><a href="#login" onclick="{login}">Login</a></li> <li><a href="#signup">Signup</a></li> </ul> <ul if="{isLogin}" class="right"> <li><a href="#user/{global.me.name}">{global.me.name}</a></li> <li><a href="" onclick="{logout}">Logout</a></li> </ul> </div> </nav> <style scoped="scoped"> :scope { display: block } nav { padding: 0px 20px; } </style>', function(opts) {
    this.login = function() {
      lock.show({ authParams: { scope: 'openid' } });
    };

    this.logout = function() {
      localStorage.removeItem('id_token');
    };
    
    this.on('update', function() {
      var id_token = localStorage.getItem('id_token');
      this.isLogin = !!id_token;
    });
  
});