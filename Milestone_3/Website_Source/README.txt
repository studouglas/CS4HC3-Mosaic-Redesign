Instructions
==============

Right click "index.html" and choose Open With > [browser] 
NOTE: the application does NOT work in Chrome, due to some security requirements of Chrome. It works in Safari, Firefox, EDGE, and modern versions of Internet Explorer. We developed on Chrome and Safari (our IDE creates a local server for Chrome so it works fine), so some small UI elements may not be aligned / proper in other browsers.

Notes
==============

Your timetable information (i.e. courses you're enrolled in, your wishlist etc.) is saved using the browser's cache, so should be persistent across sessions unless you switch browsers or clear your cache.

Wherever there's a course name that's a link, it's set to go to the undergraduate calendar instead of the specific course page. This was due to development time constraints, but the infrastructure is there (we'd just need to change the link field in the json courses file).

Some courses may only have a Lecture 7 or a Tutorial 2. This is because we manually entered the course data so did not bother to make it 100% accurate.

The menu items for the dropdown in the upper right don't do anything, this is expected.

There is a bug where one course can have a conflict between a lecture and a tutorial of the same course, this will mess up the weekly schedule but won't affect anything else. Again, this was due to time constraints and using fake data for the courses file.

*************
Final Note: we put a ton of effort into this website, we encourage you to try breaking it, deal with conflicts, change times for enrolled courses etc!


