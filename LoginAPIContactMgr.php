<?php

	$inData = getRequestInfo();
	
	$id = 0;
	$firstName = "";
	$lastName = "";

	$conn = new mysqli("localhost", "TheBeast", "Data=cool", "ContactMgr"); 	
	if( $conn->connect_error )
	{
		returnWithError( $conn->connect_error );
	}
	else
	{
		// Only search by username, get the hash separately
		$stmt = $conn->prepare("SELECT UserID,FirstName,LastName,PasswordHash FROM Users WHERE Username=?");
		$stmt->bind_param("s", $inData["username"]);
		$stmt->execute();
		$result = $stmt->get_result();

		if( $row = $result->fetch_assoc() )
		{
			// Verify the plain password against the stored hash
			if( password_verify($inData["password"], $row['PasswordHash']) )
			{
				returnWithInfo( $row['FirstName'], $row['LastName'], $row['UserID'] );
			}
			else
			{
				returnWithError("Invalid Password");
			}
		}
		else
		{
			returnWithError("User Not Found");
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
	
	function returnWithInfo( $firstName, $lastName, $id )
	{
		$retValue = '{"id":' . $id . ',"firstName":"' . $firstName . '","lastName":"' . $lastName . '","error":""}';
		sendResultInfoAsJson( $retValue );
	}	
?>
