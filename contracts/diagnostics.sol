pragma solidity ^0.8.0;
import "./clinic.sol";

contract diagnostics is clinic {
    // Registers a diagnostic on the blockchain
    function registerDiagnostic(
        string memory _Diagname,
        string memory _email,
        uint128 _phone,
        string memory _license
    ) external {
        grantAccess(msg.sender);
        diagnostics.push(msg.sender);
        DiagnosticIndex[msg.sender] = Diagnostic(
            _Diagname,
            _email,
            _phone,
            _license
        );
    }

    // Returns profile of all patients who have granted access to the diagnostic
    function getPatientsForDiagnostic()
        external
        view
        returns (PatientProfile[] memory)
    {
        uint patientCount = DiagnosticAccessList[msg.sender].length;
        PatientProfile[] memory patients = new PatientProfile[](patientCount);
        for (uint i = 0; i < patientCount; i++) {
            address currPatAddress = DiagnosticAccessList[msg.sender][i];
            patients[i] = getPatientProfile(currPatAddress);
        }
        return patients;
    }

    // Returns health records of patient of the diagnostic if authorized
    function getHealthRecordsDiagnostic(
        address patAddress
    ) public view returns (HealthRecord[] memory) {
        require(isAuthorizedDiagnostic(patAddress, msg.sender), "unauthorized");
        return userRecords[patAddress];
    }

    // Returns profile of all diagnostics on the blockchain
    function getAllDiagnostics()
        external
        view
        returns (DiagnosticProfile[] memory)
    {
        uint256 numDiagnostics = diagnostics.length;
        DiagnosticProfile[] memory allDiagnostics = new DiagnosticProfile[](
            numDiagnostics
        );
        for (uint256 i = 0; i < numDiagnostics; i++) {
            address diagnosticAddress = diagnostics[i];
            Diagnostic memory curr = DiagnosticIndex[diagnosticAddress];
            allDiagnostics[i] = DiagnosticProfile(
                curr.Diagname,
                curr.email,
                curr.phone,
                curr.license,
                diagnosticAddress
            );
        }
        return (allDiagnostics);
    }

    // Returns profiles of the diagnostics authorized by the user
    function getDiagnosticsForUser()
        external
        view
        returns (DiagnosticProfile[] memory)
    {
        uint count = 0;
        DiagnosticProfile[] memory authDiagnostic = new DiagnosticProfile[](50);
        for (uint i = 0; i < diagnostics.length; i++) {
            if (isAuthorizedDiagnostic(msg.sender, diagnostics[i])) {
                Diagnostic memory curr = DiagnosticIndex[diagnostics[i]];
                authDiagnostic[count] = DiagnosticProfile(
                    curr.Diagname,
                    curr.email,
                    curr.phone,
                    curr.license,
                    diagnostics[i]
                );
                count++;
            }
        }
        return (authDiagnostic);
    }

    // Uploads health records of the patient to the blockchain by authorized diagnostic
    function uploadRecordsDiagnostic(
        address _patient,
        string memory _org,
        string memory _date,
        string memory _docName,
        string memory _name,
        string memory _path,
        string memory _cid,
        string memory _docType
    ) external {
        require(isAuthorizedDiagnostic(_patient, msg.sender), "unauthorized");
        userRecords[_patient].push(
            HealthRecord(
                _org,
                _date,
                _name,
                _docName,
                _path,
                _cid,
                _patient,
                _docType
            )
        );
    }

    // Returns position of the user in the DiagnosticAccessList of the specific diagnostic
    function getPatientIndexDia(
        address _diagnostc,
        address _user
    ) internal view returns (uint256) {
        address[] memory Diagnostics = DiagnosticAccessList[_diagnostc];
        for (uint256 i = 0; i < Diagnostics.length; i++) {
            if (Diagnostics[i] == _user) {
                return i;
            }
        }
        return Diagnostics.length;
    }

    // Revokes access of the diagnostic to the patient's records
    function revokeAccessDiagnostic(address _diagnostic) external {
        uint256 index = getPatientIndexDia(_diagnostic, msg.sender);

        address[] storage users = DiagnosticAccessList[_diagnostic];
        if (index < users.length) {
            users[index] = users[users.length - 1];
            users.pop();
        }
    }
}
