<?php

	$inData = getRequestInfo();
	
	$searchResults = "";
	$searchCount = 0;

	$conn = new mysqli("localhost", "TheBeast", "Data=cool", "ContactMgr");
	if ($conn->connect_error) 
	{
		returnWithError( $conn->connect_error );
	} 
	else
	{
		// Handle space-separated search terms (e.g., "john doe")
		$searchTerms = explode(" ", trim($inData["search"]));
		
		if (count($searchTerms) >= 2) {
			// Multi-word search: assume first word is first name, rest is last name
			$firstName = "%" . $searchTerms[0] . "%";
			$lastName = "%" . implode(" ", array_slice($searchTerms, 1)) . "%";
			$fullSearch = "%" . $inData["search"] . "%";
			
			$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE 
				((FirstName LIKE ? AND LastName LIKE ?) OR 
				 FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ? OR 
				 CONCAT(FirstName, ' ', LastName) LIKE ?) AND UserID=?");
			$stmt->bind_param("ssssssi", $firstName, $lastName, $fullSearch, $fullSearch, $fullSearch, $fullSearch, $inData["userId"]);
		} else {
			// Single word search: search all fields
			$searchTerm = "%" . $inData["search"] . "%";
			$stmt = $conn->prepare("SELECT ID, FirstName, LastName, Phone, Email FROM Contacts WHERE (FirstName LIKE ? OR LastName LIKE ? OR Phone LIKE ?) AND UserID=?");
			$stmt->bind_param("sssi", $searchTerm, $searchTerm, $searchTerm, $inData["userId"]);
		}
		$stmt->execute();
		
		$result = $stmt->get_result();
		
		while($row = $result->fetch_assoc())
		{
			if( $searchCount > 0 )
			{
				$searchResults .= ",";
			}
			$searchCount++;
			$searchResults .= '{"id":' . $row["ID"] . ',"firstName":"' . $row["FirstName"] . '","lastName":"' . $row["LastName"] . '","phone":"' . $row["Phone"] . '","email":"' . $row["Email"] . '"}';
		}
		
		if( $searchCount == 0 )
		{
			returnWithError( "No Records Found" );
		}
		else
		{
			returnWithInfo( $searchResults );
		}
		
		$stmt->close();
		$conn->close();
	}

	function getRequestInfo()
	{
		return json_decode(file_get_contents('php://input'), true);
	}

	function sendResultInfoAsJson( $obj )
	{
		header('Content-type: application/json');
		echo $obj;
	}
	
	function returnWithError( $err )
	{
		$retValue = '{"id":0,"firstName":"","lastName":"","error":"' . $err . '"}';
		sendResultInfoAsJson( $retValue );
	}
	
	function returnWithInfo( $searchResults )
	{
		$retValue = '{"results":[' . $searchResults . '],"error":""}';
		sendResultInfoAsJson( $retValue );
	}
	
?>