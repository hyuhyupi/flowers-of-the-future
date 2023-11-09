//heading animation
var text = ["","GARDENS", "KNOWLEDGE", "CREATIVITY", "COMMUNITY", "THE FUTURE"];
var counter = 0;
var elem = document.getElementById("header-text-gardens");
setInterval(change, 1700);
function change() {
elem.innerHTML = text[counter];
counter++;
if(counter >= text.length) { counter = 0; }
}

//dropup 1
function myFunction() {
  document.getElementById("myDropup").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn1')) {
    var dropdowns = document.getElementsByClassName("dropup-content");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

//dropup 2
function myFunction2() {
  document.getElementById("myDropup2").classList.toggle("show");
}

// Close the dropdown menu if the user clicks outside of it
window.onclick = function(event) {
  if (!event.target.matches('.dropbtn2')) {
    var dropdowns = document.getElementsByClassName("myDropup2");
    var i;
    for (i = 0; i < dropdowns.length; i++) {
      var openDropdown = dropdowns[i];
      if (openDropdown.classList.contains('show')) {
        openDropdown.classList.remove('show');
      }
    }
  }
}

