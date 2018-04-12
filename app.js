!function(lo) {
  var db = firebase.database();
  firebase.auth().signInAnonymously().catch(function(error) { console.error(error) });
  
  _.$1 = sel => () => $1(sel);

  const init_user = uid => {
    let new_todos = [{ title: 'Hello, World!', completed: false }];
    return _.go(`users/${uid}`,
      path => db.ref(path).set({ todos: new_todos }),
      (res) => { 
        window.localStorage.uid = uid;
        return lo.todos = new_todos;
      },
      _.catch(err => console.error(err)));
  }

  const load_todo = uid => {
    return _.go(`users/${uid}`,
      path => db.ref(path).once('value'),
      function(snap) {
        return lo.todos = snap.val().todos;
      });
  }

  const push_todo = title => {
    let new_todo = { title, completed: false };
    lo.todos.push(new_todo);
    return _.go(`users/${window.localStorage.uid}`,
      path => db.ref(path).set({ todos: lo.todos }),
      () => new_todo);
  }

  const after_auth = function(user) {
    if (user) {
      _.go(window.localStorage.uid,
        _.if2(_.idtt)(uid => load_todo(uid),
        ).else(() => init_user(user.uid)),
        _.sum(_.if2(_.v('title'))(
          lo.todo_item = todo => pug`
            li
              .view
              input.toggle[type=checkbox]
              label ${todo.title}
              button.destroy
          `
        )),
        $.append_to('ul.todo-list'),

        _.$1('.todoapp'),
        $.on('keyup', 'input.new-todo', _.if2(_.v('keyCode'), _.is_equal(13))(
          _.v('$currentTarget'),
          _.tap(
            $.val,
            push_todo,
            lo.todo_item,
            $.append_to('ul.todo-list')
          ),
          $.val('')
        ))
      )
    }
  }

  firebase.auth().onAuthStateChanged(after_auth);

}({});