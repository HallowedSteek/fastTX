import { useState, CSSProperties, FC } from 'react';
import {
    useCSVReader,
    lightenDarkenColor,
    formatFileSize,
} from 'react-papaparse';

const GREY = '#CCC';
const GREY_LIGHT = 'rgba(255, 255, 255, 0.4)';
const DEFAULT_REMOVE_HOVER_COLOR = '#A01919';
const REMOVE_HOVER_COLOR_LIGHT = lightenDarkenColor(
    DEFAULT_REMOVE_HOVER_COLOR,
    40
);
const GREY_DIM = '#686868';

const styles = {
    zone: {
        alignItems: 'center',
        border: `2px dashed ${GREY}`,
        borderRadius: 20,
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        justifyContent: 'center',
        padding: 20,
    } as CSSProperties,
    file: {
        background: 'linear-gradient(to bottom, #EEE, #DDD)',
        borderRadius: 20,
        display: 'flex',
        height: 120,
        width: 120,
        position: 'relative',
        zIndex: 10,
        flexDirection: 'column',
        justifyContent: 'center',
    } as CSSProperties,
    info: {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        paddingLeft: 10,
        paddingRight: 10,
    } as CSSProperties,
    size: {
        backgroundColor: GREY_LIGHT,
        borderRadius: 3,
        marginBottom: '0.5em',
        justifyContent: 'center',
        display: 'flex',
    } as CSSProperties,
    name: {
        backgroundColor: GREY_LIGHT,
        borderRadius: 3,
        fontSize: 12,
        marginBottom: '0.5em',
    } as CSSProperties,
    progressBar: {
        bottom: 2,
        left:3,
        position: 'absolute',
        width: '100%',
        paddingLeft: 0,
        paddingRight: 0,
    } as CSSProperties,
    zoneHover: {
        borderColor: GREY_DIM,
    } as CSSProperties,
    default: {
        borderColor: GREY,
    } as CSSProperties,
    remove: {
        height: 23,
        position: 'absolute',
        right: 0,
        top: 0,
        width: 23,
    } as CSSProperties,
};

type Props = {
  setData: (value: React.SetStateAction<Array<Array<string>>>) => void;
}


const CSVReader:FC<Props> = ({setData}) => {
    const { CSVReader } = useCSVReader();
    const [zoneHover, setZoneHover] = useState(false);
    const [removeHoverColor, setRemoveHoverColor] = useState(
        DEFAULT_REMOVE_HOVER_COLOR
    );


    return (
        <CSVReader
            onUploadAccepted={(results: any) => {
                // console.log('---------------------------');
                // console.log(results);
                // console.log(results.data[1][0])
                // console.log(typeof (results.data[0][0]))
                // console.log('---------------------------');
                
                let check = true;

                 results.data[0].map((item:string)=>{
                    const header = item.toLowerCase().replace(" ","");
                    if(header==="discordid" || header==="role" || header==="salary" || header==="walletaddress" ){
                         return true;
                        }
                    else{
                        check = false;
                        return false;
                    }
                });

                console.log(check);

                if(check){
                    setData([]);
                    results.data.map((item:any, index:number)=>{
                        if(index>0)
                        { 
                            console.log(item);
                            setData(prevItem=>[...prevItem,item])
                        }
                    })
                }
                
                setZoneHover(false);
            }}
            onDragOver={(event: DragEvent) => {
                event.preventDefault();
                setZoneHover(true);
            }}
            onDragLeave={(event: DragEvent) => {
                event.preventDefault();
                setZoneHover(false);
            }}
        >
            {({
                getRootProps,
                acceptedFile,
                ProgressBar,
                getRemoveFileProps,
                Remove,
            }: any) => (
                <>
                    <div className=' bg-purple-400 border-4 cursor-pointer  border-purple-700 border-dashed hover:bg-purple-500 p-2  mr-8 lg:mr-0 text-xl rounded w-auto shd relative'
                        {...getRootProps()}
                        // style={Object.assign(
                        //     {},
                        //     styles.zone,
                        //     zoneHover && styles.zoneHover
                        // )}
                    >
                        {acceptedFile ? (
                            <>
                                <div className=' bg-purple-400 cursor-pointer  border-purple-700 p-2 '>
                                    <div style={styles.info}>
                                       
                                        <span className=' text-xl'>{acceptedFile.name}</span>
                                    </div>
                                    <div style={styles.progressBar}>
                                        <ProgressBar />
                                    </div>
                                    <div
                                        {...getRemoveFileProps()}
                                        style={styles.remove}
                                        onMouseOver={(event: Event) => {
                                            event.preventDefault();
                                            setRemoveHoverColor(REMOVE_HOVER_COLOR_LIGHT);
                                        }}
                                        onMouseOut={(event: Event) => {
                                            event.preventDefault();
                                            setRemoveHoverColor(DEFAULT_REMOVE_HOVER_COLOR);
                                        }}
                                    >
                                        <Remove color={removeHoverColor} />
                                    </div>
                                </div>
                            </>
                        ) : (
                            'Drop CSV file here or click to upload'
                        )}
                    </div>
                </>
            )}
        </CSVReader>
    );
}



export default CSVReader;