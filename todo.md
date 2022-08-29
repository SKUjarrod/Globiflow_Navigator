* LINKS OF INTEREST

 https://codepen.io/jonobr1/pen/wvqRLbR?editors=0010 morphing verticies for appObject opening and closing
 https://workflow-automation.podio.com/help/using-actions.php All Actions in globiflow

 https://developers.podio.com/ Podio and globiflow API. Could possible change over model to this

* TODO LIST 

could possibly salvage the podio API code by using podio api to pull data from podio about fields e.g. updating a item  gives the enum of the option selected from the catagory field in the podio app. Could use podio API to get the name of the category under the selected enum value.???????

fix connections again for some apps that were working previously.

switch connections over to their own object that contains all current data. This will allow for the same connection behaiour but also to incorperate some meta data like the connection name e.g. this updates this, this flow references this app

convert all the object postion transforms into transformation matricies and add scaling to them

fix connection line scaling issue and drift.

fix the CalculateExternalEntityOffset parentFlow offset code. it currently doesn't go to the parentFlow's current position, i think it goes to the randomly generated position when the flow element is created

refactor all old globalArray code into new tree data structure to represent data relations

need to change way flowConnection lines are drawn. Change it so it only updates apps and flows that were modified in the frame e.g. position, scale...  Currently it updates every connection line

create tree structure for flows

fix slight offset of flows when opening and closing apps. In Object_Functions.js. Bus is with the scaling of the groups from the anchor which is top left i believe


create view for focused elements

create html banner elements
develop workspace scene switching
make temp app selection
work on state serialisation

work on app position offsets
work on odd number flow positioning


Should move/ split up this main file into a data file. So there will be a main file for hooking everything together, data for everything data and Object_Functions for everything physical Two.js elements


* NOTE
the S:n in the base64 decoded step details stand for size. Where n = a number representing num characters