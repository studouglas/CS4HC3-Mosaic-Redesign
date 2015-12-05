'use strict';

var allCourses;      // array of course objects from json
var wishlistCourses; // array, items have format '12-C01-T02-L00' where 12 is courseId and 00 indicates no lab
var enrolledCourses; // array, same format as above

/***********************************************
* Setup functions called on load 
***********************************************/
$(function () {
    $("#header").load("templates/header.html");
    allCourses = loadCoursesFromJson();
    wishlistCourses = getWishlistCourses();
    enrolledCourses = getEnrolledCourses();
});

$(document).ready(function () {
    if (window.location.href.indexOf("searchresults.html") > -1) {
        addSearchedCoursesToHtml();
    } else if (window.location.href.indexOf('enroll.html') > -1) {
        addWishlistAndEnrolledCoursesToHtml();
    }
});

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
//=====================================================


/***********************************************
* adding courses to html table rows
***********************************************/
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
        var course = getCourse(searchedCourses[i]);
        addCourseRowToPage(course, $(".course-table")[0]);
        addedCourseRow = true;
    }
    
    if (!addedCourseRow) {
        $(".no-results")[0].style.display = "inline-block";
        $(".course-table")[0].style.display = "none";
    }
}

function addWishlistAndEnrolledCoursesToHtml() {
    if (wishlistCourses.length <= 0) {
        $(".no-wishlist")[0].style.display = "inline-block";
        $(".wishlist-table")[0].style.display = "none";
    } else {
        $(".no-wishlist")[0].style.display = "none";
        $(".wishlist-table")[0].style.display = "table";
        for (var i = 0; i < wishlistCourses.length; i++) {
            var course = getCourse(wishlistCourses[i].split('-')[0]);
            addCourseRowToPage(course, $(".wishlist-table")[0]);
        }
    }
    
    if (enrolledCourses.length <= 0) {
        $(".no-enrolled")[0].style.display = "inline-block";
        $(".enrolled-table")[0].style.display = "none";
    } else {
        $(".no-enrolled")[0].style.display = "none";
        $(".enrolled-table")[0].style.display = "table";
        for (var i = 0; i < enrolledCourses.length; i++) {
            var course = getCourse(enrolledCourses[i].split('-')[0]);
            addCourseRowToPage(course, $(".enrolled-table")[0]);
        }
    }
}

function addCourseRowToPage(course, courseTable) {
    var courseRowHtml = '<tbody id=course-id-' + course.id + '>\n';
    courseRowHtml += getCourseRowInnerHtml(course, '', '', '');
    courseRowHtml += '</tbody>\n';   
    courseTable.innerHTML += courseRowHtml;
}

function getCourseRowInnerHtml(course, lecture, tutorial, lab) {
    var courseRowHtml = "";
    lecture = lecture.trim();
    tutorial = tutorial.trim();
    lab = lab.trim();
    
    // TOP ROW (of 3) ======================================================
    courseRowHtml += '<tr class="course-table-row">\n';
    courseRowHtml += '<td class="course-table-code">\n';
    courseRowHtml += '<a target="_blank" href="' + course.link + '">' + course.subject + ' ' + course.code + '</a></td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row">\n';
    courseRowHtml += '<select class="course-table-dropdown" id="lecture-dropdown-id-' + course.id + '" onchange="sectionDropdownChanged(this,' + course.id + ') "' + ((course.lectures.length == 0) ? 'disabled' : '') + '>\n'
    for (var i = 0; i < course.lectures.length; i++) {
        var section = course.lectures[i];
        if (lecture == '') {
            lecture = section.core;
        }
        var coreNum = parseInt(section.core.substring(1));
        courseRowHtml += '<option value="' + section.core + '" ' + ((section.core == lecture) ? ' selected' : ' ') + '>Lecture ' + coreNum + '</option>\n';
    }
    courseRowHtml += '</select></td>\n';
    courseRowHtml += getTimetableHtml(course, lecture);
    
    courseRowHtml += '<td class="course-table-enrolled" rowspan="3">' + course.enrolled + '</td>\n';
    courseRowHtml += '<td class="course-table-action" rowspan="3">\n';
    courseRowHtml += '<a class="ghost-button course-table-action-button ';
    
    var buttonAdded = false;
    for (var i = 0; i < enrolledCourses.length; i++) {
        if (enrolledCourses[i] == course.id) {
            courseRowHtml += 'disabled-button">&#10003; Enrolled</a>\n';
            buttonAdded = true;
            break;
        }
    }
    if (!buttonAdded) {
        for (var i = 0; i < wishlistCourses.length; i++) {
            if (wishlistCourses[i] == course.id) {
                courseRowHtml += 'disabled-button">&#10003; On Wishlist</a>\n';
                buttonAdded = true;
                break;
            }
        }
    }
    if (!buttonAdded) {
        courseRowHtml += '" onclick=addCourseToWishlist(' + course.id + ')>Add to Wishlist</a>\n';
    }
    courseRowHtml += '</td></tr>\n';
 
    // MIDDLE ROW (of 3) ======================================================
    courseRowHtml += '<tr class="course-table-row">\n';
    courseRowHtml += '<td class="course-table-title">' + course.name + '</td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row">\n';
    courseRowHtml += '<select class="course-table-dropdown" id="tutorial-dropdown-id-' + course.id + '" onchange="sectionDropdownChanged(this,' + course.id + ') "' + ((course.tutorials.length == 0) ? 'disabled' : '') + '>\n';
    for (var i = 0; i < course.tutorials.length; i++) {
        var section = course.tutorials[i];
        if (tutorial == '') {
            tutorial = section.tut;
        }
        var coreNum = parseInt(section.tut.substring(1));
        courseRowHtml += '<option value="' + section.tut + '" ' + ((section.tut == tutorial) ? 'selected' : ' ') + '>Tutorial ' + coreNum + '</option>\n';
    }
    courseRowHtml += '</select></td>\n';
    courseRowHtml += getTimetableHtml(course, tutorial);

    // BOTTOM ROW (of 3) ======================================================
    courseRowHtml += '<tr class="course-table-row course-table-row-bottom">\n';
    courseRowHtml += '<td class="course-table-professor">' + course.professor + '</td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row">\n';
    courseRowHtml += '<select class="course-table-dropdown" id="lab-dropdown-id-' + course.id + '" onchange="sectionDropdownChanged(this,' + course.id + ') "' + ((course.labs.length == 0) ? 'disabled' : '') + '>\n';
    for (var i = 0; i < course.labs.length; i++) {
        var section = course.labs[i];
        if (lab == '') {
            lab = section.lab;
        }
        var coreNum = parseInt(section.lab.substring(1));
        courseRowHtml += '<option value="' + section.lab + '" ' + ((section.lab == lab) ? ' selected' : ' ') +  '>Lab ' + coreNum + '</option>\n';
    }
    courseRowHtml += '</select></td>\n';
    courseRowHtml += getTimetableHtml(course, lab);
    
    return courseRowHtml;
}

function getTimetableHtml(course, sectionStr) {
    var timetableHtml = "";
    var timeTextDaysOfWeek = ['','','','',''];
    var coreTimesFromJson = [];
    
    if (sectionStr != '') {
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
    }
    
    for (var i = 0; i < timeTextDaysOfWeek.length; i++) {
        for (var j = 0; j < coreTimesFromJson.length; j++) {
            // very very ugly -- but it works
            var coreTimeSplit = coreTimesFromJson[j].split('_');
            var coreTimePrettyString = parseInt(coreTimeSplit[1].split(":")[0]) + ":" + coreTimeSplit[1].split(":")[1] + " - ";
            var startHour = parseInt(coreTimeSplit[1].split(":")[0]);
            var endTime = (startHour + parseInt(coreTimeSplit[2])) + ":" + coreTimeSplit[1].split(":")[1];
            coreTimePrettyString += endTime;

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
//=====================================================


/***********************************************
* jQuery / UI Events 
***********************************************/
function sectionDropdownChanged(sender, courseId) {
    var selectedLecture = getSelectedSection('lecture', courseId);
    var selectedTutorial = getSelectedSection('tutorial', courseId);
    var selectedLab = getSelectedSection('lab', courseId);
        
    var rowSelector = "#course-id-" + courseId;
    var course = getCourse(courseId);
    
    $(rowSelector)[0].innerHTML = getCourseRowInnerHtml(course, selectedLecture, selectedTutorial, selectedLab);
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

function addCourseToWishlist(courseId) {    
    var lecture = getSelectedSection('lecture', courseId);
    var tutorial = getSelectedSection('tutorial', courseId);
    var lab = getSelectedSection('lab', courseId);
    
    updateWishlistOrEnrolled(courseId, lecture, tutorial, lab, false, true);
}

function headerAccountDropdownClicked() {
    if ($(".header-account-dropdown")[0].style.visibility === "visible") {
        $(".header-account-dropdown")[0].style.visibility = "hidden";
    } else {
        $(".header-account-dropdown")[0].style.visibility = "visible";
    }
}
//=====================================================


/*******************************************************
*   Loading courses / wishlist / enrollrd
********************************************************/
function getCourse(courseId) {
    for (var i = 0; i < allCourses.length; i++) {
        if (allCourses[i].id == courseId) {
            return allCourses[i];
        }
    }
    return null;
}

function getSelectedSection(sectionTypeStr, courseId) {
    var dropdownSelector = '#' + sectionTypeStr + '-dropdown-id-' + courseId;
    
    var selectedSection = $(dropdownSelector)[0].value;
    
    // if selected, format is 'C01 selected' so need to fix
    if (selectedSection.indexOf('selected') > -1) {
        selectedSection = selectedSection.substring(0, selectedSection.indexOf('selected'));
    }
    
    return selectedSection.trim();    
}

function formattedCourseString(courseId, lecture, tutorial, lab) {
    if (lecture == '') {
        lecture = 'C00';
    }
    if (tutorial == '') {
        tutorial = 'T00';
    }
    if (lab == '') {
        lab = 'L00'
    }
    return (courseId + '-' + lecture + '-' + tutorial + '-' + lab);
}

function updateWishlistOrEnrolled(courseId, lecture, tutorial, lab, removingCourse, toWishlist) {
    var updatedExistingCourse = false;
    var courseArray = (toWishlist) ? wishlistCourses : enrolledCourses;

    // remove the course or update its times
    for (var i = 0; i < courseArray.length; i++) {
        if (courseArray[i].split('-')[0] == courseId) {
            if (!removingCourse) {
                courseArray[i] = formattedCourseString(courseId, lecture, tutorial, lab);
                updatedExistingCourse = true;
                break;
            } else {
                courseArray.splice(i); // removes element at index i
            }
        }
    }
    
    // add new course
    if (!removingCourse && !updatedExistingCourse) {
        courseArray.push(formattedCourseString(courseId, lecture, tutorial, lab));
    }
    
    if (toWishlist) {
        localStorage.setItem("wishlistCourses", courseArray.join());
        wishlistCourses = getWishlistCourses();
    } else {
        localStorage.setItem("enrolledCourses", courseArray.join());
        enrolledCourses = getEnrolledCourses();
    }
}

function getWishlistCourses() {
    console.log("wishlistCourses: " + localStorage.getItem("wishlistCourses"));
    if (localStorage.getItem("wishlistCourses") != null) {
        return localStorage.getItem("wishlistCourses").split(',');
    } else {
        return [];
    }
}

function getEnrolledCourses() {
    console.log("enrolledCourses: " + localStorage.getItem("enrolledCourses"));
    if (localStorage.getItem("enrolledCourses") != null) {
        return localStorage.getItem("enrolledCourses").split(',');
    } else {
        return [];
    }
}

function clearWishlist() {
    localStorage.removeItem("wishlistCourses");
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
//=====================================================


/*******************************************************
*   Loading courses / wishlist / enrollrd
********************************************************/
function getWeeklyTime(){
    for (var i = 0; i < enrolledCourses.length; i++) {
       var course = getCourse(enrolledCourses[i]);
    }
}

function getExamDates(){
    for (var i = 0; i < enrolledCourses.length; i++) {
        var course = getCourse(enrolledCourses[i]);
        var examTime = course.exam
        // add the course to the exam time table
    }
}
//=====================================================
