/*jshint passfail: false */
'use strict';

$(function () {
    $("#header").load("templates/header.html");
});

// called from templates/header.html once it's loaded
function headerFinishedLoading() {
    setCurrentPage();
}

// header must be loaded first
function setCurrentPage() {
    var currentPage = window.location.href.substring(window.location.href.lastIndexOf('/') + 1);
    switch (currentPage) {
    case "index.html":
        $(".nav-home").addClass("current-page");
        break;    
    case "":
        $(".nav-home").addClass("current-page");
        break;
    case "viewschedule.html":
        $(".nav-view-schedule").addClass("current-page");
        break;
    case "searchcourses.html":
        $(".nav-search-courses").addClass("current-page");
        break;
    case "enroll.html":
        $(".nav-enroll-drop").addClass("current-page");
        break;
    }
}

function headerAccountDropdownClicked() {
    if ($(".header-account-dropdown")[0].style.visibility == "visible") {
        $(".header-account-dropdown")[0].style.visibility = "hidden"
    } else {
        $(".header-account-dropdown")[0].style.visibility = "visible"
    }
}


//Search courses function for ungreying search fields and button
function srchBttnUpdate() {
	var slct1 = document.getElementById("subselect");
	var slct2 = document.getElementById("levselect");
	var slct3 = document.getElementById("crsselect");
	var subTxt = slct1.options[slct1.selectedIndex].text;
	var levTxt = slct2.options[slct2.selectedIndex].text;
	if (subTxt != "Choose Subject"){
		//ungrey level select
		//ungrey button
	}
	if (levTxt != "Choose Level"){
		//ungrey course select
	}
}
