import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

type DeviceListProps = {
  devices: string[];
  handleDelete: (deviceName: string) => void;
  searchedDeviceName: string;
};

const DeviceList: React.FC<DeviceListProps> = ({ devices, handleDelete, searchedDeviceName }) => {
  if (!devices.length) {
    return <p>No users found for the device.</p>;
  }

  return (
    <table className="table table-striped mt-3">
      <thead>
        <tr>
          <th>List of users with access for a device</th>
          <th style={{ width: '1%', whiteSpace: 'nowrap' }}>Actions</th> {/* Style applied here */}
        </tr>
      </thead>
      <tbody>
        {devices.map((device, index) => (
          <tr key={index}>
            <td>{device}</td>
            <td style={{ display: 'flex', justifyContent: 'flex-end' }}> {/* Style applied here */}
              <Button
                variant="outline-danger"
                onClick={() => handleDelete(device)}
                className="btn-sm"
                title="Remove device from user"
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </Button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default DeviceList;
