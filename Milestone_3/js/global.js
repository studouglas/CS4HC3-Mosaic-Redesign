'use strict';

var allCourses;      // array of course objects from json
var wishlistCourses; // format: '12-C01-T00-L03'
var enrolledCourses; // format: '12-C01-T00-L03'

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
    } else if (window.location.href.indexOf('searchcourses.html') > -1) {
        populateSearchCriteriaDropdowns();
        setSearchCriteriaFromUrl();
    } else if (window.location.href.indexOf('examschedule.html') > -1) {
        loadExamHtml();
    } else if (window.location.href.indexOf('viewschedule.html') > -1) {
        loadWeeklyScheduleHtml();
    }
    
    // clear cached searches if navigate away from enroll/search pages
    if (window.location.href.indexOf("searchcourses.html") < 0
     && window.location.href.indexOf("searchresults.html") < 0
     && window.location.href.indexOf("enroll.html") < 0) {
        localStorage.removeItem("cachedSearch");
        localStorage.removeItem("cachedSearchCriteria");
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
function populateSearchCriteriaDropdowns() {
    var subjectDropdown = $("#search-criteria-subject-dropdown")[0];
    var levelDropdown = $("#search-criteria-level-dropdown")[0];
    var codeDropdown = $("#search-criteria-code-dropdown")[0];
    var selectedSubject = subjectDropdown.value;
    
    subjectDropdown.innerHTML = '<option value="NONE">Select Subject...</option>';
    levelDropdown.innerHTML = '<option value="NONE">Select Level...</option>';
    codeDropdown.innerHTML = '<option value="NONE">Select Course Code...</option>';

    var subjects = [];
    var levels = [];
    var codes = [];
    
    for (var i = 0; i < allCourses.length; i++) {
        if (!arrayContainsElement(subjects, allCourses[i].subject)) {
            subjects.push(allCourses[i].subject);
        }
    }

    if (selectedSubject != 'NONE') {
        for (var i = 0; i < allCourses.length; i++) {
            if (allCourses[i].subject == selectedSubject) {
                if (!arrayContainsElement(levels, allCourses[i].code.charAt(0))) {
                    levels.push(allCourses[i].code.charAt(0));
                }
                if (!arrayContainsElement(codes, allCourses[i].code)) {
                    codes.push(allCourses[i].code);
                }   
            }
        }
    }
    
    subjects.sort();
    levels.sort();
    codes.sort();
    
    for (var i = 0; i < subjects.length; i++) {
        subjectDropdown.innerHTML += '\n<option value="' + subjects[i] + '">' + subjects[i] + '</option>';
    }
    for (var i = 0; i < levels.length; i++) {
        levelDropdown.innerHTML += '\n<option value="' + levels[i] + '">' + levels[i] + '</option>';    
    }
    for (var i = 0; i < codes.length; i++) {
        codeDropdown.innerHTML += '\n<option value="' + codes[i] + '">' + codes[i] + '</option>';
    }
    setSelectedOptionToValue(subjectDropdown, selectedSubject);
}

function setSearchCriteriaFromUrl() {
    if (window.location.href.indexOf("searchcourses.html?criteria=") < 0) {
        return;
    }
    var cachedCriteria = window.location.href.substring(window.location.href.indexOf("?criteria=") + 10, window.location.href.length); // 10 is length of '?criteria='
    cachedCriteria = replaceCharactersInString(cachedCriteria, '_', ' ');
    console.log(cachedCriteria);
    
    var cachedSubject = cachedCriteria.split('-')[0];
    var cachedLevel = cachedCriteria.split('-')[1];
    var cachedCode = cachedCriteria.split('-')[2];
    
    if (cachedSubject != 'NONE') {
        setSelectedOptionToValue($("#search-criteria-subject-dropdown")[0], cachedSubject);
        populateSearchCriteriaDropdowns();
    }
    if (cachedLevel != 'NONE') {
        setSelectedOptionToValue($("#search-criteria-level-dropdown")[0], cachedLevel);
    }
    if (cachedCode != 'NONE') {
        setSelectedOptionToValue($("#search-criteria-code-dropdown")[0], cachedCode);
    }
    searchCriteriaDropdownChanged(null);
}

function addSearchedCoursesToHtml() {
    var searchedCourses = window.location.href.substring(window.location.href.indexOf("?results=") + 9); // 9 = length of '?results='
    if (window.location.href.indexOf("?results=") < 0 || searchedCourses == null || searchedCourses == 'null') {
        $(".no-results")[0].style.display = "inline-block";
        $(".course-table")[0].style.display = "none";
        localStorage.removeItem("cachedSearch");
        if (window.location.href.indexOf("?results=") > -1) {
            window.location.href = 'searchresults.html';
        }
        return;
    }
    $(".course-table")[0].style.display = "table";
    $(".no-results")[0].style.display = "none";
    
    localStorage.setItem("cachedSearch", searchedCourses);

    searchedCourses = searchedCourses.split(",");
    
    var addedCourseRow = false;
    for (var i = 0; i < searchedCourses.length; i++) {
        var course = getCourse(searchedCourses[i]);
        addCourseRowToPage(course, $(".course-table")[0], "search");
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
            addCourseRowToPage(course, $(".wishlist-table")[0], "wishlist");
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
            addCourseRowToPage(course, $(".enrolled-table")[0], "enrolled");
        }
    }
}

function addCourseRowToPage(course, courseTable, tableTypeStr) {
    var courseRowHtml = '<tbody id=course-id-' + course.id + '>\n';

    var lecture = '';
    var tutorial = '';
    var lab = '';
    
    if (tableTypeStr == "search" || tableTypeStr == "wishlist") {
        for (var i = 0; i < wishlistCourses.length; i++) {
            if (wishlistCourses[i].split('-')[0] == course.id) {
                lecture = wishlistCourses[i].split('-')[1];
                tutorial = wishlistCourses[i].split('-')[2];
                lab = wishlistCourses[i].split('-')[3];
                break;
            }
        }
    }
    if (tableTypeStr == "search" || tableTypeStr == "enrolled") {
        for (var i = 0; i < enrolledCourses.length; i++) {
            if (enrolledCourses[i].split('-')[0] == course.id) {
                lecture = enrolledCourses[i].split('-')[1];
                tutorial = enrolledCourses[i].split('-')[2];
                lab = enrolledCourses[i].split('-')[3];
                break;
            }
        }
    }
    
    var modifiedRows = '';
    if (tableTypeStr == 'wishlist') {        
        if (lecture != '' && isTimetableConflict(lecture, course.id)) {
            modifiedRows += 'C1';
        }
        if (tutorial != '' && isTimetableConflict(tutorial, course.id)) {
            modifiedRows += 'T1';
        }
        if (lab != '' && isTimetableConflict(lab, course.id)) {
            modifiedRows += 'L1'
        }
    }
        
    if (lecture == 'C00') {
        lecture = '';
    }
    if (tutorial == 'T00') {
        tutorial = '';
    }
    if (lab == 'L00') {
        lab = '';
    }

    courseRowHtml += getCourseRowInnerHtml(course, lecture, tutorial, lab, tableTypeStr, modifiedRows);
    courseRowHtml += '</tbody>\n';   
    courseTable.innerHTML += courseRowHtml;
}

/* tableTypeStr = ['enrolled','wishlist','search']
 * modifiedRows is 'C0T0L0' or 'L0' or '' if none, or 'C1' if has conflict */
function getCourseRowInnerHtml(course, lecture, tutorial, lab, tableTypeStr, modifiedRows) {
    var courseRowHtml = "";
    lecture = lecture.trim();
    tutorial = tutorial.trim();
    lab = lab.trim();
    
    // TOP ROW (of 3) ======================================================
    var highlightRowClass = '';
    if (modifiedRows.indexOf('C0') > -1) {
        highlightRowClass = 'course-table-highlighted-row';
    } else if (modifiedRows.indexOf('C1') > -1) {
        highlightRowClass = 'course-table-highlighted-red-row';
    }
    courseRowHtml += '<tr class="course-table-row">\n';
    courseRowHtml += '<td class="course-table-code">\n';
    courseRowHtml += '<a target="_blank" href="' + course.link + '">' + course.subject + ' ' + course.code + '</a></td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row ' + highlightRowClass +'">\n';
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
    courseRowHtml += getTimetableHtml(course, lecture, highlightRowClass);
    courseRowHtml += '<td class="course-table-enrolled" rowspan="3">' + course.enrolled + '</td>\n';
    courseRowHtml += '<td class="course-table-action" rowspan="3">\n';

    if (tableTypeStr == "wishlist") {
        courseRowHtml += getCourseTableButtonHtml(course.id, tableTypeStr, (modifiedRows.indexOf('1') < 0));
    } else {
        courseRowHtml += getCourseTableButtonHtml(course.id, tableTypeStr, (modifiedRows != '' && modifiedRows.indexOf('1') < 0));
    }
    courseRowHtml += '</td></tr>\n';
 
    // MIDDLE ROW (of 3) ======================================================
    var highlightRowClass = '';
    if (modifiedRows.indexOf('T0') > -1) {
        highlightRowClass = 'course-table-highlighted-row';
    } else if (modifiedRows.indexOf('T1') > -1) {
        highlightRowClass = 'course-table-highlighted-red-row';
    }
    courseRowHtml += '<tr class="course-table-row">\n';
    courseRowHtml += '<td class="course-table-title">' + course.name + '</td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row ' + highlightRowClass + '">\n';
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
    courseRowHtml += getTimetableHtml(course, tutorial, highlightRowClass);

    // BOTTOM ROW (of 3) ======================================================
    var highlightRowClass = '';
    if (modifiedRows.indexOf('L0') > -1) {
        highlightRowClass = 'course-table-highlighted-row';
    } else if (modifiedRows.indexOf('L1') > -1) {
        highlightRowClass = 'course-table-highlighted-red-row';
    }
    courseRowHtml += '<tr class="course-table-row course-table-row-bottom">\n';
    courseRowHtml += '<td class="course-table-professor">' + course.professor + '</td>\n';
    courseRowHtml += '<td class="course-table-dropdown-row ' + highlightRowClass + '">\n';
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
    courseRowHtml += getTimetableHtml(course, lab, highlightRowClass);
    
    return courseRowHtml;
}

function getTimetableHtml(course, sectionStr, highlightRowClass) {
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
    timetableHtml += '<td class="course-table-day-text ' + highlightRowClass + '">' + timeTextDaysOfWeek[0] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text ' + highlightRowClass + '">' + timeTextDaysOfWeek[1] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text ' + highlightRowClass + '">' + timeTextDaysOfWeek[2] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text ' + highlightRowClass + '">' + timeTextDaysOfWeek[3] + '</td>\n';
    timetableHtml += '<td class="course-table-day-text ' + highlightRowClass + '">' + timeTextDaysOfWeek[4] + '</td>\n';

    return timetableHtml;
}

function getCourseTableButtonHtml(courseId, tableTypeStr, buttonShouldBeEnabled) {
    if (tableTypeStr == 'search') {
        for (var i = 0; i < enrolledCourses.length; i++) {
            if (enrolledCourses[i].split('-')[0] == courseId) {
                return '<a class="ghost-button course-table-action-button disabled-button">&#10003; Enrolled</a>\n';
            }
        }
        for (var i = 0; i < wishlistCourses.length; i++) {
            if (wishlistCourses[i].split('-')[0] == courseId) {
                return '<a class="ghost-button course-table-action-button disabled-button">&#10003; On Wishlist</a>\n';
            }
        }
        return '<a class="ghost-button course-table-action-button" onclick=addCourseToWishlist(' + courseId + ')>Add to Wishlist</a>\n';
    }

    else if (tableTypeStr == 'wishlist') {
        var ret = '<a class="ghost-button course-table-action-button" onclick=removeCourseFromWishlist(' + courseId +')>Remove</a>\n';
        if (buttonShouldBeEnabled) {
            ret += '<a class="ghost-button highlighted-button course-table-action-button" onclick=enrollFromWishlist(' + courseId + ')>Enroll</a>\n';
        } else {
            ret += '<a class="ghost-button course-table-action-button disabled-button">Enroll</a>\n';
        }
        return ret;
    }
    
    else if (tableTypeStr == 'enrolled') {
        var ret = '';
        if (buttonShouldBeEnabled) {
            ret = '<a class="ghost-button course-table-action-button highlighted-button" onclick=saveTimetableChangesFromEnrolled(' + courseId + ')>Save Changes</a>\n';
        } else {
            ret = '<a class="ghost-button course-table-action-button disabled-button">Save Changes</a>\n';
        }
        return (ret + '<a class="ghost-button highlighted-red-button course-table-action-button" onclick=dropCourseFromEnrolled(' + courseId + ')>Drop</a>\n');
    }
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
    
    var tableTypeStr = '';
    if (isDescendant($(".wishlist-table")[0], $(rowSelector)[0])) {
        tableTypeStr = "wishlist";
    } else if (isDescendant($(".enrolled-table")[0], $(rowSelector)[0])) {
        tableTypeStr = "enrolled";
    } else {
        tableTypeStr = "search";
    }

    var modifiedRows = '';
    var isEnrolledTable = isDescendant($(".enrolled-table")[0], $(rowSelector)[0]);
    var isWishlistTable = isDescendant($(".wishlist-table")[0], $(rowSelector)[0])
    if (isEnrolledTable) {        
        // find current course (i.e. one which dropdown changed) and iff its value was modified as compared
        // to what's stored in enrolled courses, colour it red or green
        for (var i = 0; i < enrolledCourses.length; i++) {
            if (enrolledCourses[i].split('-')[0] == courseId) {
                if (enrolledCourses[i].split('-')[1] != selectedLecture && selectedLecture != '') {
                    if (!isTimetableConflict(selectedLecture, courseId)) {
                        modifiedRows += 'C0';
                    } else if (isTimetableConflict(selectedLecture, courseId)) {
                        modifiedRows += 'C1';
                    }
                }
                if (enrolledCourses[i].split('-')[2] != selectedTutorial && selectedTutorial != '') {
                    if (!isTimetableConflict(selectedTutorial, courseId)) {
                        modifiedRows += 'T0';
                        console.log("No conflict in " + selectedTutorial + ' courseid: ' + courseId);
                    } else if (isTimetableConflict(selectedTutorial, courseId)) {
                        modifiedRows += 'T1';
                    }
                }
                if (enrolledCourses[i].split('-')[3] != selectedLab && selectedLab != '') {
                    if (!isTimetableConflict(selectedLab, courseId) && selectedLab) {
                        modifiedRows += 'L0';
                    } else if (isTimetableConflict(selectedLab, courseId)) {
                        modifiedRows += 'L1'
                    }
                }
                break;
            }    
        }
    }

    if (isWishlistTable) {
//        for (var i = 0; i < wishlistCourses.length; i++) {
//            if (wishlistCourses[i].split('-')[0] == courseId) {
                if (selectedLecture != '' && isTimetableConflict(selectedLecture, courseId)) {
                    modifiedRows += 'C1';
                }
                if (selectedTutorial != '' && isTimetableConflict(selectedTutorial, courseId)) {
                    modifiedRows += 'T1';
                }
                if (selectedLab != '' && isTimetableConflict(selectedLab, courseId)) {
                    modifiedRows += 'L1'
                }
//                break;
//            }    
//        }
    }
    
    $(rowSelector)[0].innerHTML = getCourseRowInnerHtml(course, selectedLecture, selectedTutorial, selectedLab, tableTypeStr, modifiedRows);
}

function returnToSearchCriteria() {
    var cachedSearchCriteria = localStorage.getItem("cachedSearchCriteria");
    if (cachedSearchCriteria != '' && cachedSearchCriteria != null) {
        window.location.href = 'searchcourses.html?criteria=' + cachedSearchCriteria;
    } else {
        window.location.href = 'searchcourses.html';
    }
}

function returnToSearchResults() {
    var cachedSearch = localStorage.getItem("cachedSearch");
    if (cachedSearch != '' && cachedSearch != null) {
        window.location.href = 'searchresults.html?results=' + cachedSearch;
    } else {
        window.location.href = 'searchresults.html';
    }
}

function searchCriteriaDropdownChanged(sender) {
    var lightGreen = '#95e5bd';
    var darkGray = '#bcbcbc';
    var darkText = '#2E2E2E';
    var noBackground = 'transparent';
    
    var subjectIsChosen = ($("#search-criteria-subject-dropdown")[0].value != 'NONE');
    var enableButton = false;
    
    // Colours
    $("#search-criteria-subject-container")[0].style.backgroundColor = subjectIsChosen ? lightGreen : 'transparent';

    $("#search-criteria-number1-container")[0].style.backgroundColor = subjectIsChosen ? lightGreen : 'transparent';
    $("#search-criteria-number2-container")[0].style.backgroundColor = 'transparent';
    $("#search-criteria-number2-container")[0].style.borderColor = subjectIsChosen ? darkText : darkGray;
    $("#search-criteria-number2")[0].style.color = subjectIsChosen ? darkText : darkGray;

    $("#search-criteria-level-container")[0].style.backgroundColor = 'transparent';
    $("#search-criteria-level-container")[0].style.borderColor = subjectIsChosen ? darkText : darkGray;
    $("#search-criteria-code-container")[0].style.backgroundColor = 'transparent';
    $("#search-criteria-code-container")[0].style.borderColor = subjectIsChosen ? darkText : darkGray;
    $("#search-criteria-level-dropdown")[0].disabled = !subjectIsChosen;
    $("#search-criteria-code-dropdown")[0].disabled = !subjectIsChosen;
    $("#search-criteria-level-label")[0].style.color = subjectIsChosen ? darkText : darkGray;
    $("#search-criteria-code-label")[0].style.color = subjectIsChosen ? darkText : darkGray;

    $(".search-criteria-or")[0].style.color = subjectIsChosen ? darkText : darkGray;

    // Bottom row dropdowns
    if (subjectIsChosen) {
        if ($("#search-criteria-level-dropdown")[0].value != "NONE") {
            if (sender != null && isDescendant($("#search-criteria-code-container")[0], sender)) {
                setSelectedOptionToValue($("#search-criteria-level-dropdown")[0], "NONE");
            } else if (sender == null || (!isDescendant($("#search-criteria-subject-container")[0], sender))) {
                $("#search-criteria-level-container")[0].style.backgroundColor = lightGreen;
                enableButton = true;
            }
        }
        if ($("#search-criteria-code-dropdown")[0].value != "NONE") {
            if (sender != null && isDescendant($("#search-criteria-level-container")[0], sender)) {
                setSelectedOptionToValue($("#search-criteria-code-dropdown")[0], "NONE");
            } else if (sender == null || (!isDescendant($("#search-criteria-subject-container")[0], sender))) {
                $("#search-criteria-code-container")[0].style.backgroundColor = lightGreen;
                enableButton = true;
            }
        }
    }

    // Search Button
    if (enableButton) {
        $("#search-criteria-number2-container")[0].style.backgroundColor = lightGreen;
        $("#search-criteria-search-button").removeClass("disabled-button");
        $("#search-criteria-search-button").addClass("highlighted-button");
    } else {
        $("#search-criteria-search-button").addClass("disabled-button");
        $("#search-criteria-search-button").removeClass("highlighted-button");
    }
    
    if (sender != null && isDescendant($("#search-criteria-subject-container")[0], sender)) {
        populateSearchCriteriaDropdowns();
    }
    
    // cache the selected criteria
    if (subjectIsChosen) {
        var selectedSubject = $("#search-criteria-subject-dropdown")[0].value;
        selectedSubject = replaceCharactersInString(selectedSubject, ' ', '_');
        var selectedLevel = $("#search-criteria-level-dropdown")[0].value;
        var selectedCode = $("#search-criteria-code-dropdown")[0].value;
        localStorage.setItem('cachedSearchCriteria', selectedSubject + '-' + selectedLevel + '-' + selectedCode);
    }
}

function headerAccountDropdownClicked() {
    if ($(".header-account-dropdown")[0].style.visibility === "visible") {
        $(".header-account-dropdown")[0].style.visibility = "hidden";
    } else {
        $(".header-account-dropdown")[0].style.visibility = "visible";
    }
}
//=====================================================


/***********************************************
* Adding / removing from wishlist & enrolled 
***********************************************/
function searchCourses(sender) {
    if (sender.classList.contains("disabled-button")) {
        console.log("button is disalbed");
        return;
    }
    var subject = $('#search-criteria-subject-dropdown')[0].value;
    var level = $('#search-criteria-level-dropdown')[0].value;
    var code = $('#search-criteria-code-dropdown')[0].value;
    
    if (subject == 'NONE' || (level == 'NONE' && code == 'NONE')) {
        return;
    }
    
    var levelChosen = (level != 'NONE');
    var searchResults = []; // course id's of results
    for (var i = 0; i < allCourses.length; i++) {
        if (allCourses[i].subject == subject) {
            if (levelChosen) {
                if (allCourses[i].code.charAt(0) == level) {
                    searchResults.push(allCourses[i].id);
                }
            } else {
                if (allCourses[i].code == code) {
                    searchResults.push(allCourses[i].id);
                }
            }
        }
    }
    
    if (searchResults.length == 0) {
        window.location.href = "searchresults.html";
    } else {
        window.location.href = "searchresults.html?results=" + searchResults.join();
    }
}

function addCourseToWishlist(courseId) {    
    var lecture = getSelectedSection('lecture', courseId);
    var tutorial = getSelectedSection('tutorial', courseId);
    var lab = getSelectedSection('lab', courseId);
    
    updateWishlistOrEnrolled(courseId, lecture, tutorial, lab, false, true);
    $("#course-id-" + courseId)[0].innerHTML = getCourseRowInnerHtml(getCourse(courseId), lecture, tutorial, lab, "search", '');
}

function enrollFromWishlist(courseId) {
    var lecture = getSelectedSection("lecture", courseId);
    var tutorial = getSelectedSection("tutorial", courseId);
    var lab = getSelectedSection("lab", courseId);
    
    // remove from wishlist, add to enrolled
    updateWishlistOrEnrolled(courseId, lecture, tutorial, lab, true, true);
    updateWishlistOrEnrolled(courseId, lecture, tutorial, lab, false, false);
    
    $("#course-id-" + courseId)[0].remove();
    addCourseRowToPage(getCourse(courseId), $(".enrolled-table")[0], "enrolled");
}

function removeCourseFromWishlist(courseId) {
    updateWishlistOrEnrolled(courseId, '', '', '', true, true);
    $("#course-id-" + courseId)[0].remove();
}

function dropCourseFromEnrolled(courseId) {
    updateWishlistOrEnrolled(courseId, '', '', '', true, false);
    $("#course-id-" + courseId)[0].remove();
}

function isTimetableConflict(section, courseId) {
    var course = getCourse(courseId);
    var sectionTimes = [];
    if (section.charAt(0) == 'C') {
        for (var i = 0; i < course.lectures.length; i++) {
            if (course.lectures[i].core == section) {
                sectionTimes = course.lectures[i].times;
                break;
            }
        }
    } else if (section.charAt(0) == 'T') {
        for (var i = 0; i < course.tutorials.length; i++) {
            if (course.tutorials[i].tut == section) {
                sectionTimes = course.tutorials[i].times;
                break;
            }
        }
    } else if (section.charAt(0) == 'L') {
        for (var i = 0; i < course.labs.length; i++) {
            if (course.labs[i].lab == section) {
                sectionTimes = course.labs[i].times;
                break;
            }
        }
    }
    
    // for every enrolled course, for every lecture/tut/lab time check if overlaps with each of sectionTimes
    for (var i = 0; i < enrolledCourses.length; i++) {
        var enrolledCourse = getCourse(enrolledCourses[i].split('-')[0]);
        var enrolledLectureTimes = [];
        var enrolledTutorialTimes = [];
        var enrolledLabTimes = [];
        
        for (var j = 0; j < enrolledCourse.lectures.length; j++) {
            if (enrolledCourses[i].split('-')[1] == enrolledCourse.lectures[j].core) {
                enrolledLectureTimes = enrolledCourse.lectures[j].times;
            }
        }
        for (var j = 0; j < enrolledCourse.tutorials.length; j++) {
            if (enrolledCourses[i].split('-')[2] == enrolledCourse.tutorials[j].tut) {
                enrolledTutorialTimes = enrolledCourse.tutorials[j].times;
            }
        }
        for (var j = 0; j < enrolledCourse.labs.length; j++) {
            if (enrolledCourses[i].split('-')[3] == enrolledCourse.labs[j].lab) {
                enrolledLabTimes = enrolledCourse.labs[j].times;
            }
        }
        
        for (var k = 0; k < sectionTimes.length; k++) {
            for (var l = 0; l < enrolledLectureTimes.length; l++) {
                if (timesOverlap(sectionTimes[k], enrolledLectureTimes[l])) {
                    return true;
                }
            }
            for (var l = 0; l < enrolledTutorialTimes.length; l++) {
                if (timesOverlap(sectionTimes[k], enrolledTutorialTimes[l])) {
                    return true;
                }
            }
            for (var l = 0; l < enrolledLabTimes.length; l++) {
                if (timesOverlap(sectionTimes[k], enrolledLabTimes[l])) {
                    return true;
                }
            }
        }
    }
    return false;
}

// format: 'Tue_09:30_2'
function timesOverlap(timeStr1, timeStr2) {
    var day1 = timeStr1.split('_')[0];
    var day2 = timeStr2.split('_')[0];

    var startHour1 = parseInt((timeStr1.split('_')[1]).split(':')[0]);
    var startHour2 = parseInt((timeStr2.split('_')[1]).split(':')[0]);
    
    var length1 = parseInt(timeStr1.split('_')[2]);
    var length2 = parseInt(timeStr2.split('_')[2]);
    
    if (day1 != day2) {
        return false;
    }
    
    if (startHour1 == startHour2) {
        return true;
    }
    
    if (startHour1 < startHour2) {
        if (startHour1 + length1 > startHour2) {
            return true;
        }
    } else {
        if (startHour2 + length2 > startHour1) {
            return true;
        }  
    }
    return false;
}

function saveTimetableChangesFromEnrolled(courseId) {
    var lecture = getSelectedSection('lecture', courseId);
    var tutorial = getSelectedSection('tutorial', courseId);
    var lab = getSelectedSection('lab', courseId);
    
    updateWishlistOrEnrolled(courseId, lecture, tutorial, lab, false, false);
    $("#course-id-" + courseId)[0].innerHTML = getCourseRowInnerHtml(getCourse(courseId), lecture, tutorial, lab, 'enrolled', '');
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
                courseArray = removeElementAtIndex(courseArray, i);
            }
        }
    }
    
    // add new course
    if (!removingCourse && !updatedExistingCourse) {
        courseArray.push(formattedCourseString(courseId, lecture, tutorial, lab));
    }
    
    if (toWishlist) {
        if (courseArray == '') {
            localStorage.removeItem("wishlistCourses");
            wishlistCourses = [];
        } else {
            localStorage.setItem("wishlistCourses", courseArray.join());
            wishlistCourses = getWishlistCourses();
        }
    } else {
        if (courseArray == '') {
            localStorage.removeItem("enrolledCourses");
            enrolledCourses = [];
        } else {
            localStorage.setItem("enrolledCourses", courseArray.join());
            enrolledCourses = getEnrolledCourses();
        }
    }
    
    // hide or show tables as appropriate
    if (window.location.href.indexOf("enroll.html") > -1) {
        if (wishlistCourses.length == 0) {
            $(".no-wishlist")[0].style.display = "inline-block";
            $(".wishlist-table")[0].style.display = "none";
        } else {
            $(".no-wishlist")[0].style.display = "none";
            $(".wishlist-table")[0].style.display = "table";
        }
        
        if (enrolledCourses.length == 0) {
            $(".no-enrolled")[0].style.display = "inline-block";
            $(".enrolled-table")[0].style.display = "none";
        } else {
            $(".no-enrolled")[0].style.display = "none";
            $(".enrolled-table")[0].style.display = "table";
        }
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

function getWishlistCourses() {
    if (localStorage.getItem("wishlistCourses") != null) {
        return localStorage.getItem("wishlistCourses").split(',');
    } else {
        return [];
    }
}

function getEnrolledCourses() {
    if (localStorage.getItem("enrolledCourses") != null) {
        return localStorage.getItem("enrolledCourses").split(',');
    } else {
        return [];
    }
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
*   Loading timetables
********************************************************/
function loadWeeklyScheduleHtml(){
    if (enrolledCourses.length == 0) {
        $(".no-enrolled")[0].style.display = 'inline-block';
        $('.course-table')[0].style.display = 'none';
        return;
    } else {
        $(".no-enrolled")[0].style.display = 'none';
        $('.course-table')[0].style.display = 'table';
    }
    
    for (var i = 0; i < enrolledCourses.length; i++) {
       var course = getCourse(enrolledCourses[i].split('-')[0]);
    }
}

function loadExamHtml(){
    if (enrolledCourses.length == 0) {
        $(".no-enrolled")[0].style.display = 'inline-block';
        $('.course-table')[0].style.display = 'none';
        return;
    } else {
        $(".no-enrolled")[0].style.display = 'none';
        $('.course-table')[0].style.display = 'table';
    }
    
    var examDays = [];
    var examDayCourseIds = []; // kept in sync with exam days, examDays[1] corresponds with course id examDayCourseIds[1]
    for (var i = 0; i < enrolledCourses.length; i++) {
        var course = getCourse(enrolledCourses[i].split('-')[0]);
        var examDay = course.exam.split('_')[0];
        var startTime = course.exam.split('_')[1];
        var endTime = parseInt(startTime.split(':')[0]) + parseInt(course.exam.split('_')[2]) + ':' + startTime.split(':')[1];

        var courseStr = course.subject + ' ' + course.code;
        var timeStr = startTime + ' - ' + endTime;
        var locationStr = 'ITB AB102';
        
        if (arrayContainsElement(examDays, examDay)) {
            var examHtml = '<p class="day-text-top-right">' + examDay + '</p>\n';

            if ($("#multiple-exam-course-day-" + examDay)[0] == null) {
                var firstExam = getCourse(examDayCourseIds[getIndexOfElement(examDays, examDay)]);
                var firstExamCourseStr = firstExam.subject + ' ' + firstExam.code;
                var firstExamTimeStr = firstExam.exam.split('_')[1] + ' - ' + parseInt(startTime.split(':')[0]) + parseInt(course.exam.split('_')[2]) + ':' + startTime.split(':')[1];
                var firstExamLocationStr = 'ITB AB102';

                examHtml += '<div class="multiple-exams-popup-container" id="multiple-exam-day-' + examDay + '">\n';
                examHtml += '<div class="multiple-exams-popup" id="multiple-exam-course-day-' + examDay + '">\n';
                examHtml += '<p class="multiple-exam-course">' + firstExamCourseStr + '</p>\n';
                examHtml += '<p class="multiple-exam-time">' + firstExamTimeStr + '</p>\n';
                examHtml += '<p class="multiple-exam-location">' + firstExamLocationStr + '</p>\n';
                examHtml += '<hr class="multiple-exam-separator">\n';
                examHtml += '<p class="multiple-exam-course">' + courseStr + '</p>\n';
                examHtml += '<p class="multiple-exam-time">' + timeStr + '</p>\n';
                examHtml += '<p class="multiple-exam-location">' + locationStr + '</p>\n';
                examHtml += '</div><div class="arrow-down"></div></div>\n';
            } else {
                var courseHtml = '<hr class="multiple-exam-separator">\n';
                courseHtml += '<p class="multiple-exam-course">' + courseStr + '</p>\n';
                courseHtml += '<p class="multiple-exam-time">' + timeStr + '</p>\n';
                courseHtml += '<p class="multiple-exam-location">' + locationStr + '</p>\n';
                $("#multiple-exam-course-day-" + examDay)[0].innerHTML += courseHtml;
            }
            
            examHtml += '<p class="exam-center-text">\n';
            examHtml += '<p class="exam-center-text"><strong>Multiple Exams</strong></p>\n';
            examHtml += '<p class="exam-center-text"><em>Tap to see exams</em></p>\n';
            
            $("#dec-" + examDay).addClass('multiple-exams-cell');
            $("#dec-" + examDay)[0].onclick = function () {
               toggleMultipleExamsPopup(this); 
            };
            $("#dec-" + examDay)[0].innerHTML = examHtml;
        } else {
            var examHtml = '<p class="day-text-top-right">' + examDay + '</p>\n';
            examHtml += '<p class="exam-center-text">\n';
            examHtml += '<p class="exam-center-text"><strong>' + courseStr + '</strong></p>\n';
            examHtml += '<p class="exam-center-text"><em>' + timeStr + '</em></p>\n';
            examHtml += '<p class="exam-center-text">' + locationStr + '</p>\n';

            $("#dec-" + examDay).addClass('exam-day-cell');
            $("#dec-" + examDay)[0].innerHTML = examHtml;
            examDays.push(examDay);
            examDayCourseIds.push(course.id);
        }
    }
}

function toggleMultipleExamsPopup(sender) {
    var day = sender.id.split('-')[1];
    if ($("#multiple-exam-day-" + day)[0].style.visibility == 'visible') {
        $("#multiple-exam-day-" + day)[0].style.visibility = 'hidden';
    } else {
        $("#multiple-exam-day-" + day)[0].style.visibility = 'visible';
    }
}
//=====================================================


/***********************************************
* Helper functions 
***********************************************/
function isDescendant(parent, child) {
    var node = child.parentNode;
    while (node != null) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
}

function getIndexOfElement(arr, element) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == element) {
            return i;
        }
    }
    return null;
}

function setSelectedOptionToValue(selectElem, newVal) {
    for (var i = 0; i < selectElem.children.length; i++) {
        if (selectElem.children[i].selected) {
            selectElem.children[i].selected = false;
        }
        if (selectElem.children[i].value == newVal) {
            selectElem.children[i].selected = true;
        }
    }
    selectElem.value = newVal;
}

function replaceCharactersInString(string, toReplace, replaceWith) {
    var ret = '';
    for (var i = 0; i < string.length; i++) {
        if (string.charAt(i) == toReplace) {
            ret += replaceWith;
        } else {
            ret += string.charAt(i);
        }
    }
    return ret;
}

function arrayContainsElement(arr, element) {
    for (var i = 0; i < arr.length; i++) {
        if (arr[i] == element) {
            return true;
        }
    }
    return false;
}

function removeElementAtIndex(arr, index) {
    if (arr.length <= 1 || index < 0) {
        return [];
    }
    if (index > arr.length - 1) {
        return arr;
    }
    
    if (index < arr.length - 1) {
        arr[index] = arr[arr.length - 1];
    }
    var ret = [];
    for (var i = 0; i < arr.length - 1; i++) {
        ret[i] = arr[i];
    }
    return ret;
}
//=====================================================
