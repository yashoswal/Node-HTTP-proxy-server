// Proxylist data array for filling in info box
var proxyListData = [];


// DOM Ready =============================================================
$(document).ready(function() {

    // Populate the user table on initial page load
    //populateTable();

    populateChangeResponseTable();
    // proxuy URL link click
    $('#proxyList table tbody').on('click', 'td a.linkshowproxy', showProxyInfo);


    

    $('#btnAddChangeResponseProxy').on('click', addChangeResponseProxy)
    // update proxy button click
     
    $('#btnUpdateResponse').on('click', updateResponseProxy);

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
    $('#updateProxy fieldset input#updateProxyLatency').val(thisProxyObject.latency);
    
};

function addChangeResponseProxy()
{
    event.preventDefault();

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

                // Update the table
              // populateTable();
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


//update proxy configurations
function updateProxy(event) {
    event.preventDefault();

    // Super basic validation - increase errorCount variable if any fields are blank
    var errorCount = 0;
    $('#updateProxy input').each(function(index, val) {
        if($(this).val() === '') { errorCount++; }
    });

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
            'latency': $('#updateProxy fieldset input#updateProxyLatency').val()
        }

       
        $.ajax({
            type: 'PUT',
            data: newProxy,
            url: '/api/simpleproxy/'+id, // + $('#proxyID').text(),
            dataType: 'JSON'
        }).done(function( response ) {

            // Check for successful (blank) response
            if (response.msg === '') {

                // Clear the form inputs
                $('#updateProxy fieldset input').val('');
                $('#updateProxy fieldset label#updateProxyURL').text('');
                $('#updateProxy fieldset input#updateProxyTargetURL').val('');
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




