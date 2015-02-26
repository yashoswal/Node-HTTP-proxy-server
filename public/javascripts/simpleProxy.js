// Proxylist data array for filling in info box
var proxyListData = [];


// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();

    // proxuy URL link click
    $('#proxyList table tbody').on('click', 'td a.linkshowproxy', showProxyInfo);


    // Add proxy button click
    $('#btnAddProxy').on('click', addProxy);

    // update proxy button click
    $('#btnUpdateProxy').on('click', updateProxy);

    // Delete proxy link click
    $('#proxyList table tbody').on('click', 'td a.linkdeleteproxy', deleteProxy);

    //start proxy server button click
    $('#btnStartProxy').on('click', startProxyServer);

    //start proxy server button click
    $('#btnRefresh').on('click', populateTable);

    //stop proxy server 
    $('#btnStopProxy').on('click', stopProxyServer);

    $('#btnGo').on('click', saveUser);

});



function saveUser(event)
{
    event.preventDefault();
    user = $('#txtUser').val();;
    populateTable();
}

// Functions =============================================================

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';


    // jQuery AJAX call for JSON
    $.getJSON( '/api/forwardproxy/', function( data ) {

        // Stick our proxy data array into a proxylist variable in the global object
       //proxyListData = data.Simpleproxy;
       proxyListData = data;

        // For each item in our JSON, add a table row and cells to the content string
        $.each(proxyListData, function(){

            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkshowproxy" rel="' + this.configid + '" title="Show Details">' + this.configid + '</a></td>';
           // tableContent += '<td>' + this.port + '</td>';
            tableContent += '<td>' + this.targeturl + '</td>';
            tableContent += '<td>' + this.latency + '</td>';
            tableContent += '<td>' + this.proxyurl + '</td>';
            tableContent += '<td>' + this.forwardurl + '</td>';

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
        $('#proxyList table tbody').html(tableContent);
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
    $('#updateProxy fieldset input#updateProxyForwardURL').val(thisProxyObject.forwardurl);
    $('#updateProxy fieldset input#updateProxyLatency').val(thisProxyObject.latency);
    
};

function addProxy(event) {
    event.preventDefault();

//    user =  $('#txtUser').val();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    
    if($.trim($('#addProxy fieldset input#inputProxyTargetURL').val()).length < 1) { errorCount++; }
    

    // Check and make sure errorCount's still at zero
    if(errorCount === 0) {

        // If it is, compile all proxy info into one object
        var newProxy = {
          
            'targeturl': $('#addProxy fieldset input#inputProxyTargetURL').val(),
            'forwardurl': $('#addProxy fieldset input#inputProxyForwardURL').val(),
            'latency': $('#addProxy fieldset input#inputLatency').val()

        }

        // Use AJAX to post the object to our adduser service
        $.ajax({
            type: 'POST',
            data: newProxy,
            url: '/api/forwardproxy',
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {
                // Clear the form inputs
                $('#addProxy fieldset input').val('');

                // Update the table
                populateTable();

            }
            else {

                // If something goes wrong, alert the error message that our service returned
                alert('Error: ' + response.msg);

            }
        });
    }
    else {
        // If errorCount is more than 0, error out
        alert('Please fill in all the fields');
        return false;
    }
};



//update proxy configurations
function updateProxy(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    /*$('#updateProxy input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });*/


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
            'proxyurl': $('#updateProxy fieldset label#updateProxyURL').text(),
            'targeturl': $('#updateProxy fieldset input#updateProxyTargetURL').val(),
            'forwardurl': $('#updateProxy fieldset input#updateProxyForwardURL').val(),
            'latency': $('#updateProxy fieldset input#updateProxyLatency').val()
        }

       
        $.ajax({
            type: 'PUT',
            data: newProxy,
            url: '/api/forwardproxy/'+id, // + $('#proxyID').text(),
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
                $('#updateProxy fieldset input#updateProxyForwardURL').val('');
                $('#updateProxy fieldset input#updateProxyLatency').val('');
                $('#updateProxy fieldset span#proxyID').text('');

                // Update the table
                populateTable();

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

// Delete Proxy
function deleteProxy(event) {

    event.preventDefault();

    // Pop up a confirmation dialog
    var confirmation = confirm('Are you sure you want to delete this Proxy?');

    // Check and make sure the user confirm
    if (confirmation === true) {

        $.ajax({
                 type : 'DELETE',
                 data: '',
                 url : 'http://localhost:8006/proxyserver/forwardproxy/'+$(this).attr('rel'),
                 dataType : 'JSON'

        }).done(function(response){

    
            //update configuration data
            var data = {
             'targeturl': $('#updateProxy fieldset input#updateProxyTargetURL').val(),
             'forwardurl': $('#updateProxy fieldset input#updateProxyForwardURL').val(),
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
            url: '/api/forwardproxy/'+$(this).attr('rel'),
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for a successful (blank) response
            if (response.msg === '') {
                 // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
                $('#updateProxy fieldset input#updateProxyForwardURL').val('');
                $('#updateProxy fieldset input#updateProxyLatency').val('');
                $('#updateProxy fieldset span#proxyID').text('');
            }
            else {
                alert('Error: ' + response.msg);
            }

            // Update the table
            populateTable();

        });

    }
    else {

        // If they said no to the confirm, do nothing
        return false;
    }

};


function stopProxyServer(){


    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;

    if($('#updateProxy fieldset span#proxyID').text() === '')
    {
        errorCount++;
    }

    var configid = $('#updateProxy fieldset span#proxyID').text();

    if(errorCount == 0)
    {
        $.ajax({
                 type : 'DELETE',
                 data: '',
                 url : 'http://localhost:8006/proxyserver/forwardproxy/'+configid,
                 dataType : 'JSON'

        }).done(function(response){
             // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
                $('#updateProxy fieldset input#updateProxyForwardURL').val('');
                $('#updateProxy fieldset input#updateProxyLatency').val('');
                $('#updateProxy fieldset span#proxyID').text('');

                        populateTable();

        });    

    }
    else{
        alert("Please select a proxy to stop");
    }
};

function startProxyServer(){

    var errorCount = 0;
   

    if($('#updateProxy fieldset span#proxyID').text() === '')
    {
        errorCount++;
    }

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
             url : 'http://localhost:8006/proxyserver/forwardproxy',
             dataType : 'JSON'

        }).done(function(response){
             // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
                $('#updateProxy fieldset input#updateProxyForwardURL').val('');
                $('#updateProxy fieldset input#updateProxyLatency').val('');
                $('#updateProxy fieldset span#proxyID').text('');
            populateTable();

        });
    }

    else
    {
        alert("Please select a proxy configuration from the list");
    }
};
