var through = require('through2');
var gutil = require('gulp-util');
var exec = require('child_process').exec;
var escape = require('any-shell-escape');
var path = require('path');

// want to get the current git hash instead?
// git.revParse({args:'--short HEAD'})

module.exports = function(message, opt) {
  if(!opt) opt = {};
  if(!message) throw new Error('gulp-git: Commit message is required git.commit("commit message")');
  if (!opt.cwd) opt.cwd = process.cwd();
  if(!opt.args) opt.args = ' ';

  var files = [];
  var paths = [];
  var defaultCwd = process.cwd();

  var write = function(file, enc, cb){
    files.push(file);
    paths.push(path.relative(opt.cwd, file.path).replace('\\','/'));
    cb();
  };

  var flush = function(cb){
    var cmd = 'git commit -m "' + message + '" ' + opt.args + " " + escape(paths);
    var that = this;
    exec(cmd, {cwd: opt.cwd}, function(err, stdout, stderr){
      if(err) return cb(err);
      gutil.log(stdout, stderr);
      files.forEach(that.push.bind(that));
      cb();
    });
  };

  return through.obj(write, flush);
};
