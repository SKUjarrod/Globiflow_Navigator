* LINKS OF INTEREST

 https://codepen.io/jonobr1/pen/wvqRLbR?editors=0010 morphing verticies for appObject opening and closing
 https://workflow-automation.podio.com/help/using-actions.php All Actions in globiflow

 https://developers.podio.com/ Podio and globiflow API. Could possible change over model to this

* TODO LIST 

fix connection line scaling issue and drift.

need to change way flowConnection lines are drawn. Change it so it only updates apps and flows that were modified in the frame e.g. position, scale...  Currently it updates every connection line

create tree structure for flows

fix slight offset of flows when opening and closing apps. In Object_Functions.js. Bus is with the scaling of the groups from the anchor which is top left i believe

calculating action details doesnt work for email actions yet


create view for focused elements

create html banner elements
develop workspace scene switching
make temp app selection
figure out how apps with nested flows will look like
work on state serialisation

work on app position offsets
work on odd number flow positioning


Should move/ split up this main file into a data file. So there will be a main file for hooking everything together, data for everything data and Object_Functions for everything physical Two.js elements


* NOTE
the S:n in the base64 decoded step details stand for size. Where n = a number representing num characters