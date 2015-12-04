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

function addCourseRowToPage(course, courseTable) {
    console.log("ADDING COURSE:" + course.id);
    var courseRowHtml = "";

    // TOP ROW (of 3)
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
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
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
 
    // MIDDLE ROW (of 3)
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
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td></tr>\n';

    // BOTTOM ROW (of 3)
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
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td>\n';
    courseRowHtml += '<td class="course-table-day-text"></td></tr>\n';

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