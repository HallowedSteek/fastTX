import { FC } from 'react';
import { useCSVDownloader } from 'react-papaparse';

type Props = {
    data: Array<Array<string>>
  }

const CSVDownloader: FC<Props> = ({data}) => {
    const { CSVDownloader, Type } = useCSVDownloader();

    return (
        <CSVDownloader
            type={Type.Button}
            filename={'paymentTable'}
            bom={true}
            config={{
                delimiter: ';',
            }}
            data={data}
        >
          <h1 className="bg-purple-600 hover:bg-purple-700 p-2  mr-8 lg:mr-0 text-xl rounded w-auto shd">EXPORT CSV</h1>
        </CSVDownloader>
    );
}


export default CSVDownloader;