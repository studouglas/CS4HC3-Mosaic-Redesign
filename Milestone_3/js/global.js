/*global $, setCurrentPage, loadCoursesFromJson, addSearchedCoursesToHtml*/
'use strict';

var allCourses;
var wishlistCourses;
var enrolledCourses;

$(function () {
    $("#header").load("templates/header.html");
    allCourses = loadCoursesFromJson();

    if (localStorage.getItem("wishlistCourses") != null) {
        wishlistCourses = localStorage.getItem("wishlistCourses").split(',');
    } else {
        wishlistCourses = [];
    }
    if (localStorage.getItem("enrolledCourses") != null) {
        enrolledCourses = localStorage.getItem("enrolledCourses").split(',');
    } else {
        enrolledCourses = [];
    }
});

$(document).ready(function () {
    if (window.location.href.indexOf("searchresults.html") > -1) {
        addSearchedCoursesToHtml();
    }
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
    if ($(".header-account-dropdown")[0].style.visibility === "visible") {
        $(".header-account-dropdown")[0].style.visibility = "hidden";
    } else {
        $(".header-account-dropdown")[0].style.visibility = "visible";
    }
}

function addSearchedCoursesToHtml() {
    if (window.location.href.indexOf("?results=") < 0) {
        $(".no-results")[0].style.display = "inline-block";
        $(".course-table")[0].style.display = "none";
        return;
    }
    $(".course-table")[0].style.display = "table";
    $(".no-results")[0].style.display = "none";
    var searchedCourses = window.location.href.substring(window.location.href.indexOf("?results=") + 9); // 9 = length of '?results='
    searchedCourses = searchedCourses.split(",");
    
    var addedCourseRow = false;
    for (var i = 0; i < searchedCourses.length; i++) {
        for (var j = 0; j < allCourses.length; j++) {
            if (searchedCourses[i] == allCourses[j].id) {
                addCourseRowToPage(allCourses[j], $(".course-table")[0]);
                addedCourseRow = true;
            }
        }
    }
    
    if (!addedCourseRow) {
        $(".no-results")[0].style.display = "inline-block";
        $(".course-table")[0].style.display = "none";
    }
}
function getTimetableHtml(course, sectionStr) {
    var timetableHtml = "";
    var timeTextDaysOfWeek = ['','','','',''];
    var coreTimesFromJson = [];

    if (sectionStr.charAt(0) == "C") {
        for (var i = 0; i < course.lectures.length; i++) {
            if (course.lectures[i].core == sectionStr) {
                coreTimesFromJson = course.lectures[i].times;
                break;
            }
        }
    } else if (sectionStr.charAt(0) == "T") {
        for (var i = 0; i < course.tutorials.length; i++) {
            if (course.tutorials[i].tut == sectionStr) {
                coreTimesFromJson = course.tutorials[i].times;
                break;
            }
        }
    } else {
        for (var i = 0; i < course.labs.length; i++) {
            if (course.labs[i].lab == sectionStr) {
                coreTimesFromJson = course.labs[i].times;
                break;
            }
        }
    }
    
    for (var i = 0; i < timeTextDaysOfWeek.length; i++) {
        for (var j = 0; j < coreTimesFromJson.length; j++) {
            var coreTimeSplit = coreTimesFromJson[j].split('_');
            var coreTimePrettyString = parseInt(coreTimeSplit[1].split(":")[0]) + ":" + coreTimeSplit[1].split(":")[1] + " - ";
            var startHour = parseInt(coreTimeSplit[1].split(":")[0]);
            var endTime = (startHour + parseInt(coreTimeSplit[2])) + ":" + coreTimeSplit[1].split(":")[1];
            coreTimePrettyString += endTime;
            if (sectionStr.charAt(0) == "L") {
                console.log("in herre 4 lab");
            }
            if (i == 0 && coreTimeSplit[0] == "Mon") {
                timeTextDaysOfWeek[i] = coreTimePrettyString;
            } else if (i == 1 && coreTimeSplit[0] == "Tue") {
                timeTextDaysOfWeek[i] = coreTimePrettyString;
            } else if (i == 2 && coreTimeSplit[0] == "Wed") {
                timeTextDaysOfWeek[i] = coreTimePrettyString;
            } else if (i == 3 && coreTimeSplit[0] == "Thu") {
                timeTextDaysOfWeek[i] = coreTimePrettyString;
            } else if (i == 4 && coreTimeSplit[0] == "Fri") {
                timeTextDaysOfWeek[i] = coreTimePrettyString;
            }
        }
    }
    timetableHtml += '<td class="course-table-day-text">' + timeTextDaysOfWeek[0] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text">' + timeTextDaysOfWeek[1] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text">' + timeTextDaysOfWeek[2] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text">' + timeTextDaysOfWeek[3] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text">' + timeTextDaysOfWeek[4] + '</td>\n';
    
    return timetableHtml;
}

function addCourseRowToPage(course, courseTable) {
    var courseRowHtml = "";

    // TOP ROW (of 3) ======================================================
    courseRowHtml += '<tr class="course-table-row">\n';
    courseRowHtml += '<td class="course-table-code">\n';
    courseRowHtml += '<a target="_blank" href="' + course.link + '">' + course.subject + ' ' + course.code + '</a></td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row">\n';
    courseRowHtml += '<select class="course-table-dropdown"' + ((course.lectures.length == 0) ? 'disabled' : '') + '>\n'
    for (var i = 0; i < course.lectures.length; i++) {
        var section = course.lectures[i];
        var coreNum = parseInt(section.core.substring(1));
        courseRowHtml += '<option value="' + section.core + '">Lecture ' + coreNum + '</option>\n';
    }
    courseRowHtml += '</select></td>\n';
    courseRowHtml += getTimetableHtml(course, "C01");
    
    courseRowHtml += '<td class="course-table-enrolled" rowspan="3">' + course.enrolled + '</td>\n';
    courseRowHtml += '<td class="course-table-action" rowspan="3">\n';
    courseRowHtml += '<a class="ghost-button course-table-action-button ';
    
    var buttonAdded = false;
    for (var i = 0; i < enrolledCourses.length; i++) {
        if (enrolledCourses[i] == course.id) {
            courseRowHtml += '"disabled-button">&#10003; Enrolled</a>\n';
            buttonAdded = true;
            break;
        }
    }
    if (!buttonAdded) {
        for (var i = 0; i < wishlistCourses.length; i++) {
            if (wishlistCourses[i] == course.id) {
                courseRowHtml += '"disabled-button">&#10003; On Wishlist</a>\n';
                buttonAdded = true;
                break;
            }
        }
    }
    if (!buttonAdded) {
        courseRowHtml += '">Add to Wishlist</a>\n';
    }
    courseRowHtml += '</td></tr>\n';
 
    // MIDDLE ROW (of 3) ======================================================
    courseRowHtml += '<tr class="course-table-row">\n';
    courseRowHtml += '<td class="course-table-title">' + course.name + '</td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row">\n';
    courseRowHtml += '<select class="course-table-dropdown"' + ((course.tutorials.length == 0) ? 'disabled' : '') + '>\n';
    for (var i = 0; i < course.tutorials; i++) {
        var section = course.tutorials[i];
        var coreNum = parseInt(section.tut.substring(1));
        courseRowHtml += '<option value="' + section.core + '">Tutorial ' + coreNum + '</option>\n';
    }
    courseRowHtml += '</select></td>\n';
    courseRowHtml += getTimetableHtml(course, "T01");

    // BOTTOM ROW (of 3) ======================================================
    courseRowHtml += '<tr class="course-table-row course-table-row-bottom">\n';
    courseRowHtml += '<td class="course-table-professor">' + course.professor + '</td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row">\n';
    courseRowHtml += '<select class="course-table-dropdown"' + ((course.labs.length == 0) ? 'disabled' : '') + '>\n';
    for (var i = 0; i < course.labs.length; i++) {
        var section = course.labs[i];
        var coreNum = parseInt(section.lab.substring(1));
        courseRowHtml += '<option value="' + section.core + '">Lab ' + coreNum + '</option>\n';
    }
    courseRowHtml += '</select></td>\n';
    courseRowHtml += getTimetableHtml(course, "L01");

    courseTable.innerHTML += courseRowHtml;
}

function loadCoursesFromJson() {
    var coursesJson = [];
    $.ajax({
        type: 'GET',
        url: 'courses.json',
        dataType: 'json',
        success: function (data) { coursesJson = data; },
        async: false
    });
    return coursesJson.courses;
}

//Search courses function for ungreying search fields and button
function srchBttnUpdate() {
	var slct1 = document.getElementById("subselect");
	var slct2 = document.getElementById("levselect");
	var slct3 = document.getElementById("crsselect");
	var subTxt = slct1.options[slct1.selectedIndex].text;
	var levTxt = slct2.options[slct2.selectedIndex].text;
	if (subTxt != "Choose Subject"){
		document.getElementById("levselect").disabled = false;
		document.getElementById("searchbttn").className = "ghost-button highlighted-button";
	}
	if (levTxt != "Choose Level"){
		document.getElementById("crsselect").disabled = false;
	}
}
