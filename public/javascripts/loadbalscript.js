var loadbalancerdata = [];

$(document).ready(function(){
		
		populateTable();

        $('#btnRefresh').on('click', refreshData);

		$('#btnAddConfig').on('click', appendRows);

		$('#btnRemoveConfig').on('click', removeLastRow);

		$('#btnSavelbConfig').on('click', SaveLBConfiguration);

        // proxuy URL link click
        $('#loadbalancelist table tbody').on('click', 'td a.linkdeleteproxy', removeFromLoadBalancer);

        $('#loadbalancelist table tbody').on('click', 'td a.linkupdateconfig', addInstancetoBalancer);    

        $('#loadbalancelist table tbody').on('click', 'td a.linkStartBalancer', startLoadBalancer);

        $('#loadbalancelist table tbody').on('click', 'td a.linkStopBalancer', stopLoadBalancer);    
        
        $('#loadbalancelist table tbody').on('click', 'td a.linkDeleteLbConfig', deleteLoadBalancerConfig);

	//	appendRows();
});


function refreshData(event)
{   
    event.preventDefault();

    populateTable();
}

// Fill table with data
function populateTable() {

    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/api/simpleproxy/loadbalancer', function( data ) {

        // Stick our proxy data array into a proxylist variable in the global object
       //proxyListData = data.Simpleproxy;
       loadbalancerdata = data;


        // For each item in our JSON, add a table row and cells to the content string
        $.each(loadbalancerdata, function(){

            tableContent += '<tr>';
            tableContent += '<td><a href="#" class="linkStartBalancer" rel="' + this.configid + '" title="Start">Start   </a>';
            tableContent += '<a href="#" class="linkStopBalancer" rel="' + this.configid + '" title="Stop">   Stop</a>';
            tableContent += '<a href="#" class="linkDeleteLbConfig" rel="' + this.configid + '" title="Delete">    Delete</a></td>';  
            tableContent += '<td><a href="#" class="linkshowproxy" rel="' + this.configid + '" title="Show Details">' + this.configid + '</a></td>';
           // tableContent += '<td>' + this.port + '</td>';
            tableContent += '<td>' + this.targeturl + '</td>';
            tableContent += '<td>' + this.proxyurl + '</td>';

            if(Boolean(this.status))
            {
                tableContent += '<td>' + "Running" + '</td>';
            }
            else
            {
                tableContent += '<td>' + "Stopped" + '</td>';
            }
         
            tableContent += '<td><a href="#" class="linkdeleteproxy" rel="' + this.configid + '">Remove Instance</a>\
            <a href="#" class="linkupdateconfig" rel="' + this.configid + '">Add Instance</a></td>';
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#loadbalancelist table tbody').html(tableContent);
    });
};



function startLoadBalancer(event){

    event.preventDefault();


    $.ajax({

        type : "POST",
        data : { 'configid' : $(this).attr('rel') },
        url  : 'http://localhost:8006/proxyserver/loadbalancer',
        dataType : 'JSON'

    }).done(function(response){

         
        alert(response.msg);

        populateTable();

            
    });

    alert("in startLoadBalancer " + $(this).attr('rel'));
}


function stopLoadBalancer(event)
{
    event.preventDefault();

    alert("in stopLoadBalancer");

    $.ajax({

        type : "DELETE",
        url  : 'http://localhost:8006/proxyserver/loadbalancer/' + $(this).attr('rel'),
        dataType : 'JSON'

    }).done(function(response){

        alert(response.msg);

        populateTable();

    });
}


function deleteLoadBalancerConfig(event)
{
   event.preventDefault();

    //stop load balancer first
    $.ajax({

        type : "DELETE",
        url  : 'http://localhost:8006/proxyserver/loadbalancer/' + $(this).attr('rel'),
        dataType : 'JSON'

    }).done(function(response){

        alert(response.msg);

        populateTable();

    });

    //delete configuration then
    $.ajax({

        type : "DELETE",
        url  : 'http://localhost:8080/api/simpleproxy/loadbalancer/' + $(this).attr('rel'),
        dataType : 'JSON'

    }).done(function(response){

        populateTable();
            
    });

}

function removeFromLoadBalancer(event)
{
    event.preventDefault();

    var configid = $(this).attr('rel');

    var retval = prompt("Enter instance url to remove : ", "instance url here");

    alert("You entered: " + retval);

   $.ajax({

            type: "Delete",
            data: { 'instanceurl' : retval },
            url: '/api/simpleproxy/loadbalancer/'+configid+'/instance',
            dataType : JSON

    }).done(function(response){

        populateTable();
    });
}

function addInstancetoBalancer(event)
{
    event.preventDefault();

    var configid = $(this).attr('rel');
    var retval = prompt("Enter instance url : ", "instance url here");

     $.ajax({

            type: "Put",
            data: { 'instanceurl' : retval },
            url: '/api/simpleproxy/loadbalancer/'+configid+'/instance',
            dataType : JSON

    }).done(function(response){

        populateTable();
    });

}


function SaveLBConfiguration(event)
{
	event.preventDefault();


	var trows = $('#lbconfigtable tbody tr');
    var tcolumns;
    var Config = [];

    for(var i=0; i<trows.length; i++)
    {
    	var flag = false;
    	var instanceurl = $('#lbconfigtable tbody tr td input#instanceurl-'+i).val();
    	var instanceport = $('#lbconfigtable tbody tr td input#instanceport-'+i).val();
    	
    	if( $.trim(instanceurl).length > 0 && $.trim(instanceport).length > 0 )
    	{
    		Config[i] = instanceurl + ":" + instanceport;
    		flag = true;

    	}
    	else
    	{
    		alert('Please fill in the at-least one row or remove empty rows');
    	}
    }

    	if(Boolean(flag)){

    	
 		  //ajax call to save data in db
		  $.ajax({
    				type : 'POST',
    				data : { 'config' : Config },
    				dataType : JSON,
    				url : '/api/simpleproxy/loadbalancer'

    			}).done(function(response){

                        populateTable();
                 });

		    $("#lbconfigtable tbody tr").remove();
	   
 			appendRows();
                    
 		}

    console.log({'config' : Config});

}

function removeLastRow(event)
{
	event.preventDefault();

			$("#lbconfigtable tbody tr:last-child").remove();
}

function appendRows(event)
{	
	event.preventDefault();

			var firstid = $('#lbconfigtable tr:first-child td:first-child input').attr('id');
			if(firstid === undefined || $('#lbconfigtable tbody tr').length === 0)
			{
				$firstrow = "<tr>\
                            	<td><input type='text' id='instanceurl-0'></input></td>\
                            	<td><input type='text' id='instanceport-0'></input></td>\
                            	</tr>";

                $("#lbconfigtable tbody").append($firstrow);
			}
			else
			{

				if($('#lbconfigtable tbody tr').length <= 4)
				{
					//append more rows
					var lastid = $('#lbconfigtable tr:last-child td:first-child input').attr('id');
				
					$newid = parseInt(lastid.substring(12, 13)) + 1;

					$newrow = "<tr>\
                            	<td><input type='text' id='instanceurl-"+$newid+"'></input></td>\
                            	<td><input type='text' id='instanceport-"+$newid+"'></input></td>\
                            	</tr>";

                	$("#lbconfigtable tbody").append($newrow);
            	}
            	else
            	{
            		alert("Maximum 5 instances can be added to balancer");
            	}
			}
	
}