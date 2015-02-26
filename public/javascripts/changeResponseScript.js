// Proxylist data array for filling in info box
var proxyListData = [];


// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    //populateTable();
console.log ("inside the Response Proxy");
    populateChangeResponseTable();
    // proxuy URL link click
    $('#changeproxyList table tbody').on('click', 'td a.linkshowproxy', showProxyInfo);

    $('#changeproxyList table tbody').on('click', 'td a.linkdeleteproxy', deleteChangeResProxy);
    $('#btnAddChangeResponseProxy').on('click', addChangeResponseProxy)
    $('#btnStartProxy').on('click', startChangeResProxyServer);
  //stop proxy server 
    $('#btnStopProxy').on('click', stopResponseProxyServer);
  //Refresh button for updating the latest entry.
   
    $('#btnUpdateProxy').on('click', updateProxy);

    


});



// Functions =============================================================




function populateChangeResponseTable() {

    // Empty content string
    var tableContent = '';
    
    // jQuery AJAX call for JSON
    $.getJSON( '/api/simpleproxy/', function( data ) {

        // Stick our proxy data array into a proxylist variable in the global object
       //proxyListData = data.Simpleproxy;
       proxyListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(proxyListData, function(){

            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowproxy" rel="' + this.configid + '" title="Show Details">' + this.configid + '</a></td>';
           // tableContent += '<td>' + this.port + '</td>';
            tableContent += '<td>' + this.targeturl + '</td>';
            tableContent += '<td>' + this.proxyurl + '</td>';
            tableContent += '<td>' + this.originalresponse + '</td>';
            tableContent += '<td>' + this.modifiedresponse + '</td>';


            if(Boolean(this.status))
            {
                tableContent += '<td>' + "Running" + '</td>';
            }
            else
            {
                tableContent += '<td>' + "Stopped" + '</td>';
            }
         
            tableContent += '<td><a href="#" class="linkdeleteproxy" rel="' + this.configid + '">delete</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#changeproxyList table tbody').html(tableContent);
    });
};



// Show User Info
function showProxyInfo(event) {

    // Prevent Link from Firing
    event.preventDefault();
    
    	
    // Retrieve proxy URL from link rel attribute
    var thisProxyHost = $(this).attr('rel');

    // Get Index of object based on id value
    var arrayPosition = proxyListData.map(function(arrayItem) { return arrayItem.configid; }).indexOf(thisProxyHost);

    // Get our User Object
    var thisProxyObject = proxyListData[arrayPosition];

    //Populate Info Box
    $('#proxyID').text(thisProxyObject.configid);
    $('#updateProxy fieldset label#updateProxyURL').text(thisProxyObject.proxyurl);
    $('#updateProxy fieldset input#updateProxyTargetURL').val(thisProxyObject.targeturl);
    $('#updateProxy fieldset input#updateOriginalString').val(thisProxyObject.originalresponse);
    $('#updateProxy fieldset input#updateNewString').val(thisProxyObject.modifiedresponse);

};



function addChangeResponseProxy()
{
    event.preventDefault();
    
    if(event.handled !==  true)
    {
    	event.handled = true;

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#addChangeProxy input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

    if(errorCount === 0)
    {
        var newProxy ={ 'targeturl' : $('#addChangeProxy fieldset input#inputChProxyTargetURL').val(),
                        'stringtomatch' : $('#addChangeProxy fieldset input#inputStringtoreplace').val(),
                        'stringtoreplace' : $('#addChangeProxy fieldset input#inputReplacement').val()
                    }

          $.ajax({
                type : 'POST',
                data : newProxy,
                url  : '/api/simpleproxy/changeresponse',
                dataType : JSON
       }).done(function(response){

             // Check for successful (blank) response
            if (response.msg === '') {
                // Clear the form inputs
                $('#addChangeProxy input').val('');
             // Clear the form inputs
                $('#addChangeProxy fieldset input#inputChProxyTargetURL').val('');
                $('#addChangeProxy fieldset input#inputStringtoreplace').text('');
                $('#addChangeProxy fieldset input#inputReplacement').val('');
                
                
                populateChangeResponseTable();
                
            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        })

    }//if
    else
    {
        alert("Fill in all the fields");
        return false;
    }
        
    }
}

//Delete Proxy
function deleteChangeResProxy(event) {

    event.preventDefault();

    if(event.handled !==  true)
    {
    	event.handled = true;
    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this Proxy?');

    // Check and make sure the user confirm
    if (confirmation === true) {

        $.ajax({
                 type : 'DELETE',
                 data: '',
                 url : 'http://localhost:8006/proxyserver/ChangeResponse/'+$(this).attr('rel'),
                 dataType : 'JSON'

        }).done(function(response){

    
            //update configuration data
            var data = {
             'targeturl': $('#updateProxy fieldset input#updateProxyTargetURL').val(),
             'latency'  : $('#updateProxy fieldset input#updateProxyLatency').val(),
            }


            alert(response.msg);
        });    



        //now delete the proxy configuration
        var newProxy = {
            'id': $(this).attr('rel')
        }
        
        
        // If they did, do our delete
        $.ajax({
            type: 'DELETE',
            data: newProxy,
            url: '/api/simpleproxy/'+$(this).attr('rel'),
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
                 // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
                $('#updateProxy fieldset input#updateProxyLatency').val('');
                $('#updateProxy fieldset span#proxyID').text('');
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateChangeResponseTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;
    }
    }

};


function startChangeResProxyServer(event){

	if(event.handled !== true)
	{
		event.handled = true;
	
    var errorCount = 0;
    if($.trim($('#updateProxy fieldset input#updateProxyTargetURL').val()).length < 1) { errorCount++; }

    if(errorCount == 0)
    {

         var data = {
            /* 'targeturl' : $('#updateProxy fieldset input#updateProxyTargetURL').val(),
             'latency' : $('#updateProxy fieldset input#updateProxyLatency').val()*/
             'configid' : $('#updateProxy fieldset span#proxyID').text()
         }

        //alert("in startProxyServer :" + "targeturl " + data.targeturl + "latency " + data.latency);

        $.ajax({
             type : 'POST',
             data : data,
             url : 'http://localhost:8006/proxyserver/ChangeResponse',
             dataType : 'JSON'

        }).done(function(response){
             // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
                $('#updateProxy fieldset input#updateProxyLatency').val('');
                $('#updateProxy fieldset span#proxyID').text('');
            populateChangeResponseTable();
            
            alert(response.msg);
        });
    }

    else
    {
        alert("Please select a proxy configuration from the list");
    }
	}
};

function stopResponseProxyServer(){

	console.log("Entered in to stop proxt : response");
    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    
    
    if($('#updateProxy fieldset span#proxyID').text() === '')
    {
    	errorCount++;
    }

    var configid = $('#updateProxy fieldset span#proxyID').text();
    
    console.log(configid);
    
console.log("errorCount:" + errorCount)
    if(errorCount == 0)
    {
    	console.log("Entered in to stop proxt : response")
        $.ajax({
                 type : 'DELETE',
                 data: '',
                 url : 'http://localhost:8006/proxyserver/ChangeResponse/'+configid,
                 dataType : 'JSON'

        }).done(function(response){
             // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
                $('#updateProxy fieldset input#updateProxyLatency').val('');
                $('#updateProxy fieldset span#proxyID').text('');

                populateChangeResponseTable();

        });    

    }
    else{
        alert("Please select a proxy to stop");
    }
};


function updateProxy(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;

    if($('#updateProxy fieldset span#proxyID').text() === '')
    {
        errorCount++;
    }

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        var purl = $('#updateProxy fieldset input#updateProxyTargetURL').val();
        alert("Updating to "+ purl);

        // If it is, compile all proxy info into one object
        var id = $('#proxyID').text()
        var newProxy = {

            'configid': id,
           // 'proxyurl': $('#updateProxy fieldset input#updateProxyURL').val(),
            'proxyurl':  $('#addChangeProxy fieldset label#updateProxyURL').text(),
            'targeturl': $('#addChangeProxy fieldset input#updateProxyTargetURL').val(),
            'originalstring':  $('#addChangeProxy fieldset input#updateOriginalString').val(),
            'replacementstring': $('#addChangeProxy fieldset input#updateNewString').val(),
            'latency' : 0        
            }

       
        $.ajax({
            type: 'PUT',
            data: newProxy,
            url: '/api/simpleproxy/'+ $('#proxyID').text(),
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

            	// Update the table
                populateChangeResponseTable();
            	
                // Clear the form inputs
                $('##addChangeProxy fieldset label').val('');
                $('##addChangeProxy fieldset input#updateProxyURL').text('');
                $('#addChangeProxy fieldset input#updateProxyTargetURL').val('');
                $('#addChangeProxy fieldset input#inputOriginal').val('');
                $('##addChangeProxy fieldset fieldset span#inputReplacement').text('');

                

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all fields');
        return false;
    }
};





