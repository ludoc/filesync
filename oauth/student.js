var Student = function(id, token, email, name, authType){
  this.id = id;
  this.token = token;
  this.email = email;
  this.name = name;
  this.authType = authType;
  this.authenticated = true;
  Student.add(this);
}

students_tab =  new Array();
Student.add = function(student){
  students_tab.push(student)
}
Student.get = function(id){
  res = students_tab.every(function (element, index, array){
    if(element.id == id){
      out = element;
      return false;
    }
    return true;
  });
  return out;
}

Student.getAll = function(){
  return students_tab;
}
module.exports = Student;
