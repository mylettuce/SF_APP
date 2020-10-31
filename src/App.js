//import React, { useEffect, useState } from 'react';
import React, { Fragment } from 'react';
import { Button, Table, Switch, Typography, Row, Col, Tabs, Modal, InputNumber, Drawer, Descriptions, Divider, Popconfirm, Checkbox, Progress, Statistic, Card, Badge } from "antd";
//import { TableOutlined } from '@ant-design/icons';
import { LineChartOutlined, TableOutlined, CaretRightOutlined, PauseOutlined } from '@ant-design/icons';
import * as d3 from "d3";
import "./App.css";
import Icon from '@ant-design/icons';
import {ReactComponent as ConveyorSvg} from "./CONVEYOR.svg"
import {ReactComponent as HeatingSvg} from "./heater.svg"
//import {ReactComponent as SoundSvg} from "./sound.svg"
import {ReactComponent as ValveSvg} from "./valve.svg"
//import {ReactComponent as pumpSvg} from "./pump.svg"
import {ReactComponent as openUpSvg} from "./up-arrows-angles-couple.svg"

//const fs = window.remote.require('fs')
//const app = window.require('electron').remote
const fs = window.remote.require('fs')

const zoneNames = {
    L:['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'L11', 'L12', 'L13', 'L14', 'L15', 'L16', 'L17', 'L18', 'L19', 'L20', 'L21', 'L22', 'L23', 'L24'],
    R:['R1', 'R2', 'R3', 'R4', 'R5', 'R6', 'R7', 'R8', 'R9', 'R10', 'R11', 'R12', 'R13', 'R14', 'R15', 'R16', 'R17', 'R18', 'R19', 'R20', 'R21', 'R22', 'R23', 'R24'],
}

const ALARMS = [
    //MFC high limit
    ["MFC N2 Burnout #1~2 High Limit",  "WB0152:00"],
    ["MFC N2 Burnout #3~4 High Limit",  "WB0152:04"],
    ["MFC N2 Burnout #5~6 High Limit",  "WB0152:08"],
    ["MFC N2 Burnout #7/MR High Limit", "WB0152:12"],
    ["MFC H2 Burnout #1~2 High Limit",  "WB0152:02"],
    ["MFC H2 Burnout #3~4 High Limit",  "WB0152:06"],
    ["MFC H2 Burnout #5~6 High Limit",  "WB0152:10"],
    ["MFC H2 Burnout #7/MR High Limit", "WB0152:14"],
    //MFC low limit
    ["MFC N2 Burnout #1~2 Low Limit",   "WB0152:01"],
    ["MFC N2 Burnout #3~4 Low Limit",   "WB0152:05"],
    ["MFC N2 Burnout #5~6 Low Limit",   "WB0152:09"],
    ["MFC N2 Burnout #7/MR Low Limit",  "WB0152:13"],
    ["MFC H2 Burnout #1~2 Low Limit",   "WB0152:03"],
    ["MFC H2 Burnout #3~4 Low Limit",   "WB0152:07"],
    ["MFC H2 Burnout #5~6 Low Limit",   "WB0152:11"],
    ["MFC H2 Burnout #7/MR Low Limit",  "WB0152:15"],
    //MFC Burn out
    ["MFC N2 Burnout #1~2 Burn Out",   "WB0140:00"],
    ["MFC N2 Burnout #3~4 Burn Out",   "WB0140:02"],
    ["MFC N2 Burnout #5~6 Burn Out",   "WB0140:04"],
    ["MFC N2 Burnout #7/MR Burn Out",  "WB0140:06"],
    ["MFC H2 Burnout #1~2 Burn Out",   "WB0140:01"],
    ["MFC H2 Burnout #3~4 Burn Out",   "WB0140:03"],
    ["MFC H2 Burnout #5~6 Burn Out",   "WB0140:05"],
    ["MFC H2 Burnout #7/MR Burn Out",  "WB0140:07"],
    //cooling
    ["Cooling High Limit",  "WB0079:00"],
    ["Cooling Low Limit",   "WB0079:01"],
    ["Cooling Burn Out",    "WB0079:03"],
    //dryer
    ["Dryer High Limit",    "WB0052:00"],
    ["Dryer Low Limit",     "WB0052:01"],
    ["Dryer Burn Out",      "WB0052:03"],
    //Flow meter
    ["Flow Meter High Limit",   "WB0078:00"],
    ["Flow Meter Low Limit",    "WB0078:01"],
    ["Flow Meter Burn Out",     "WB0078:03"],
    //zone
    ...(Array(24).fill(0).map((d, index)=>(
        [`Zone #${index+1} Left High Limit`, `WB${index*2}:00`]
    ))),
    ...(Array(24).fill(0).map((d, index)=>(
        [`Zone #${index+1} Right High Limit`, `WB${index*2+1}:00`]
    ))),

    ...(Array(24).fill(0).map((d, index)=>(
        [`Zone #${index+1} Left Low Limit`, `WB${index*2}:01`]
    ))),
    ...(Array(24).fill(0).map((d, index)=>(
        [`Zone #${index+1} Right Low Limit`, `WB${index*2+1}:01`]
    ))),

    ...(Array(24).fill(0).map((d, index)=>(
        [`Zone #${index+1} Left Burn Out`, `WB${index*2}:03`]
    ))),
    ...(Array(24).fill(0).map((d, index)=>(
        [`Zone #${index+1} Right Burn Out`, `WB${index*2+1}:03`]
    ))),
    ["Inveter",                     "WB0100:06"],
    ["Low Air Pressure",            "WB0100:09"],
    ["Low H2 Pressure",             "WB0100:07"],
    ["Low N2 Pressure",             "WB0100:08"],
    ["Low Cooling Pressure",        "WB0100:11"],
    ["Low Pure Line Pressure",      "WB0100:10"],
    ["Low ultrasound Level",        "WB0101:15"],
    ["Conveyor Trip",               "WB0102:01"],
    ["Conveyor Mesh",               "WB0160:05"],
    ["Ultrasound Pump Trip",        "WB0102:00"],
    ["Emergency Stop",              "WB0150:00"],
    ["Entrance Emergency Stop",     "WB0100:00"],
    ["Export Emergency Stop",       "WB0100:01"],
    ["Driver Part Emergency Stop",  "WB0100:03"],
    ["Sensor",                      "WB0100:04"],
    //Zone trip
    ["Zone #1 NFB Trip", "WB0154:00"],
    ["Zone #2 NFB Trip", "WB0154:01"],
    ["Zone #3 NFB Trip", "WB0154:02"],
    ["Zone #4 NFB Trip", "WB0154:03"],
    ["Zone #5 NFB Trip", "WB0154:04"],
    ["Zone #6 NFB Trip", "WB0154:05"],
    ["Zone #7 NFB Trip", "WB0154:06"],
    ["Zone #8 NFB Trip", "WB0154:07"],
    ["Zone #9 NFB Trip", "WB0154:08"],
    ["Zone #10 NFB Trip", "WB0154:09"],
    ["Zone #11 NFB Trip", "WB0154:10"],
    ["Zone #12 NFB Trip", "WB0154:11"],
    ["Zone #13 NFB Trip", "WB0154:12"],
    ["Zone #14 NFB Trip", "WB0154:13"],
    ["Zone #15 NFB Trip", "WB0154:14"],
    ["Zone #16 NFB Trip", "WB0154:15"],
    ["Zone #17 NFB Trip", "WB0155:00"],
    ["Zone #18 NFB Trip", "WB0155:01"],
    ["Zone #19 NFB Trip", "WB0155:02"],
    ["Zone #10 NFB Trip", "WB0155:03"],
    ["Zone #21 NFB Trip", "WB0155:04"],
    ["Zone #22 NFB Trip", "WB0155:05"],
    ["Zone #23 NFB Trip", "WB0155:06"],
    ["Zone #24 NFB Trip", "WB0155:07"],
    //NFB trip
    ["HH NFB Trip #1~3",    "WB0158:00"],
    ["HH NFB Trip #4~6",    "WB0158:01"],
    ["HH NFB Trip #7~9",    "WB0158:02"],
    ["HH NFB Trip #10~12",  "WB0158:03"],
    ["HH NFB Trip #13~15",  "WB0158:04"],
    ["HH NFB Trip #16~18",  "WB0158:05"],
    ["HH NFB Trip #19~21",  "WB0158:06"],
    ["HH NFB Trip #22~24",  "WB0158:07"],
    //Eject Temp
    ...(Array(7).fill(0).map((d, index)=>(
        [`Eject Temp #${index+1} Left High Limit`, `WB${index*2+56}:00`]
    ))),
    ...(Array(7).fill(0).map((d, index)=>(
        [`Eject Temp #${index+1} Right High Limit`, `WB${index*2+57}:00`]
    ))),

    ...(Array(7).fill(0).map((d, index)=>(
        [`Eject Temp #${index+1} Left Low Limit`, `WB${index*2+56}:01`]
    ))),
    ...(Array(7).fill(0).map((d, index)=>(
        [`Eject Temp #${index+1} Right Low Limit`, `WB${index*2+57}:01`]
    ))),

    ...(Array(7).fill(0).map((d, index)=>(
        [`Eject Temp #${index+1} Left Burn Out`, `WB${index*2+56}:03`]
    ))),
    ...(Array(7).fill(0).map((d, index)=>(
        [`Eject Temp #${index+1} Right Burn Out`, `WB${index*2+57}:03`]
    ))),

    ["O2 High Limit", "WB0151:08"],
    ["H2 High Limit", "WB0151:10"],
    ["Conveyor High Limit", "WB0151:12"],

    ["O2 High Limit", "WB0151:09"],
    ["H2 High Limit", "WB0151:11"],
    ["Conveyor High Limit", "WB0151:13"],

    ["O2 Burn Out", "WB0151:00"],
    ["H2 Burn Out", "WB0151:01"],
    ["Conveyor Burn Out", "WB0151:02"],

    ["Wetter Tank #1 High Limit", "WB0072:00"],
    ["Wetter Tank #2 High Limit", "WB0073:00"],
    ["Wetter Tank #3 High Limit", "WB0070:00"],
    ["Wetter Tank #4 High Limit", "WB0071:00"],

    ["Wetter Tank #1 Low Limit", "WB0072:01"],
    ["Wetter Tank #2 Low Limit", "WB0073:01"],
    ["Wetter Tank #3 Low Limit", "WB0070:01"],
    ["Wetter Tank #4 Low Limit", "WB0071:01"],

    ["Wetter Tank #1 Burn Out", "WB0072:03"],
    ["Wetter Tank #2 Burn Out", "WB0073:03"],
    ["Wetter Tank #3 Burn Out", "WB0070:03"],
    ["Wetter Tank #4 Burn Out", "WB0071:03"],

    ["Weter Tank #1 HH", "WB0101:04"],
    ["Weter Tank #2 HH", "WB0101:08"],
    ["Weter Tank #3 HH", "WB0100:12"],
    ["Weter Tank #4 HH", "WB0101:00"],
    
    ["Weter Tank #1 H", "WB0101:05"],
    ["Weter Tank #2 H", "WB0101:09"],
    ["Weter Tank #3 H", "WB0100:13"],
    ["Weter Tank #4 H", "WB0101:01"],

    ["Weter Tank #1 LL", "WB0101:07"],
    ["Weter Tank #2 LL", "WB0101:11"],
    ["Weter Tank #3 LL", "WB0100:15"],
    ["Weter Tank #4 LL", "WB0101:03"],

    ["Ultrasonic LL", "WB0101:12"],
    ["Ultrasonic HH", "WB0101:15"],

    ["Wetter Tank #1 Sensor Abnormality", "WB0103:08"],
    ["Wetter Tank #2 Sensor Abnormality", "WB0103:12"],
    ["Wetter Tank #3 Sensor Abnormality", "WB0103:00"],
    ["Wetter Tank #4 Sensor Abnormality", "WB0103:04"],

    ["Wetter Tank #1 Inflow",       "WB0103:09"],
    ["Wetter Tank #2 Inflow",       "WB0103:13"],
    ["Wetter Tank #3 Inflow",       "WB0103:01"],
    ["Wetter Tank #4 Inflow",       "WB0103:05"],

    ["Wetter Tank #1 Drainage",     "WB0103:10"],
    ["Wetter Tank #2 Drainage",     "WB0103:14"],
    ["Wetter Tank #3 Drainage",     "WB0103:02"],
    ["Wetter Tank #4 Drainage",     "WB0103:06"],
]

var PLCMemory = {
    D: Array(2500).fill(0),
    W: Array(350).fill(0),
    C: Array(12).fill(0),
}
var WarmUpRate = 1;
var WSV = Array(48).fill(0)

function GetIntervalDataDict(keys, data, baseAddress, interval, procFunc) {
    if (procFunc==null) {
        return Object.fromEntries(keys.map((k, index)=>([k, data[baseAddress+interval*index]])))
    }
    else {
        return Object.fromEntries(keys.map((k, index)=>([k, procFunc(data[baseAddress+interval*index])])))
    }
}

function AlarmCheck() {
    let r = ALARMS.map((alarmDetail, index)=>{
        let alarmTitle = alarmDetail[0];
        let alarmAddress = alarmDetail[1];
        let alarmAddressMatches = alarmAddress.match(/([A-Z]*)([0-9]*):?([0-9]*)/)
        let alarmAddr = +alarmAddressMatches[2]
        let alarmBit = +alarmAddressMatches[3]
        let state = (PLCMemory[alarmAddress[0]][alarmAddr]&(1<<alarmBit))===(1<<alarmBit)
        if (state) {
            return alarmTitle
        }
        else {
            return null
        }
    }).filter((d)=>(d!==null))
    return r
}

function readPLC(address) {
    let matchs = address.match(/([A-Z]*)([0-9]*):?([0-9]*)/)
    let addr = +matchs[2]
    let bit = +matchs[3]
    if (matchs[3]==="") {
        return PLCMemory[address[0]][addr]
    }
    else {
        return (PLCMemory[address[0]][addr]&(1<<bit))===(1<<bit)
    }
}

function AlarmConfirm() {
    window.ipcRenderer.send("plcWrite", "WB0291:09", 1);
    setTimeout(()=>window.ipcRenderer.send("plcWrite", "WB0291:09", 0), 1000);
}


const readConfigFile = async () => {
    let result = await window.remote.dialog.showOpenDialog({  
        filters: [
            { name: "Zone Temperature Config", extensions: ["json"]}
        ], 
        properties: ['openFile'] })
        //console.log(result.filePaths)
        if (result.canceled === false) {
            let r = new Promise((resolve, reject) => {
                fs.readFile(result.filePaths[0], 'utf-8', (err, data) => {
                    if(err){
                        alert("An error ocurred reading the file :" + err.message);
                        reject(err)
                    }
                    else {
                        //console.log(data)
                        resolve({
                            file:result.filePaths[0], 
                            data:JSON.parse(data)
                        })
                    }
                });
            })
            return r
        }
    return
}

const writeConfigFile = async (confData) => {
    let result = await window.remote.dialog.showSaveDialog({
        filters:[
            { name: "Zone Temperature Config", extensions: ["json"]}
        ],
    })
    if (result.canceled === false) {
        fs.writeFile(result.filePath, JSON.stringify(confData), (err) => {
            if(err){
                alert("An error ocurred reading the file :" + err.message);
            }
        })
    }
    return
}

class AlarmsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            filteredInfo: ["NG"]
        }
    }
    handleChange = (pagination, filters, sorter) => {
        this.setState({
            filteredInfo: filters.state,
        })
    }
    render() {
        const columns = [
            {
                title: "ID",
                dataIndex: 'id',
                align: "center",
                width: 70,
                sorter: (a, b) => (a.id===b.id?0:(a.id>b.id?1:-1)),
            },
            {
                title: "State",
                dataIndex: "state",
                width: 100,
                render: (state) => (
                    <Badge status={state==="NG"?"error":"success"} />
                ),
                align: "center",
                filters: [
                    {
                        text: "Alarm",
                        value: "NG",
                    },
                    {
                        text: "Normal",
                        value: "OK",
                    },
                ],
                onFilter:(value, record) => record.state === value,
                sorter: (a, b) => (a.state===b.state?0:(a.state==="OK"?1:-1)),
                filteredValue:this.state.filteredInfo,
            },
            {
                title: "Alarm Detail",
                dataIndex: "detail",
            },
        ]
        const data = ALARMS.map((d, i)=>({
            id: i,
            detail: d[0],
            address: d[1],
            state: readPLC(d[1])?"NG":"OK",
        }))
        return (
            <Modal
                title="报警状态"
                width={800}
                onCancel={this.props.onClose}
                cancelButtonProps={{style:{display:"none"}}}
                onOk={this.props.onClose}
                okText="关闭"
                visible={this.props.visible}
            >
                <Button onClick={()=>{AlarmConfirm()}} type="primary">确认并关闭报警</Button>
                <Divider style={{margin:10}}>报警列表</Divider>
                <Table
                    rowKey={record => record.id}
                    pagination={false}
                    scroll={{ y: 440 }}
                    dataSource={data}
                    columns={columns}
                    bordered={false}
                    onChange={this.handleChange}
                />
            </Modal>
        )
    }
}

class LoadingModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            clearSVOnApply: false,
            data: {
                file:"", 
                data:{
                    conveyor: 0,
                    ...Array(24).fill(0).reduce((obj, entry, index) => {
                        obj[`L${index+1}`] = 0;
                        obj[`R${index+1}`] = 0;
                        return obj;
                    }, {})
                },
            },
            visible: false,
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.start===false && this.props.start===true) {
            readConfigFile()
            .then((data)=>{
                if (data) {
                    this.setState({
                        data,
                        visible: true
                    })
                }
                else {
                    this.props.onClose();
                }
            });
        }
    }
    onApply = () => {
        if(this.state.clearSVOnApply)
            WSV = Array(48).fill(0);
        for(let i=0;i<24;i++) {
            if(this.state.data.data[`L${i+1}`]!==null) {
                window.ipcRenderer.send("plcWrite", `D${i*2+800}`, this.state.data.data[`L${i+1}`]) //set TSV
                if(this.state.clearSVOnApply)
                    window.ipcRenderer.send("plcWrite", `D${i*6+300}`, 0) //clear SV
            }
            if(this.state.data.data[`R${i+1}`]!==null) {
                window.ipcRenderer.send("plcWrite", `D${i*2+801}`, this.state.data.data[`R${i+1}`]) //set TSV
                if(this.state.clearSVOnApply)
                    window.ipcRenderer.send("plcWrite", `D${i*6+303}`, 0) //clear SV
            }
        }
        if(this.state.data.data.conveyor!==null)
            window.ipcRenderer.send("plcWrite", "D0640", Math.round(this.state.data.data.conveyor * 4000 / 310.3/1.5))
    }
    render() {
        return (
            <Modal
                title="载入配置"
                visible={this.state.visible}
                onCancel={()=>{
                    this.setState({
                        visible: false,
                    })
                    this.props.onClose();
                }}
                onOk={()=>{
                    this.onApply();
                    this.props.SFMainStart();
                    this.setState({
                        visible: false,
                    });
                    this.props.onClose();
                }}
            >
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Typography.Title level={5} style={{margin:0}}>传送带速度:&nbsp;&nbsp;&nbsp;&nbsp;{this.state.data.data.conveyor} mm/min</Typography.Title>
                    </Col>
                </Row>
                <Row gutter={[8, 8]}>
                    <Col span={24}>
                        <Descriptions column={2} size="small" bordered>
                            {Array(24).fill(0).map((d, index)=>(
                                <Fragment key={index}>
                                <Descriptions.Item
                                    key={`L${index+1}`} 
                                    label={<b>L{index+1}</b>}
                                >
                                    {this.state.data.data[`L${index+1}`]} &#8451;
                                </Descriptions.Item>
                                <Descriptions.Item
                                    key={`R${index+1}`}
                                    label={<b>R{index+1}</b>}
                                >
                                    {this.state.data.data[`R${index+1}`]} &#8451;
                                </Descriptions.Item>
                                </Fragment>
                            ))}
                        </Descriptions>
                    </Col>
                </Row>
                <Row align="middle" justify="end">
                    <Col>
                        <Checkbox
                            checked={this.state.clearSVOnApply}
                            onChange={(e)=>{this.setState({clearSVOnApply:e.target.checked})}}
                        >
                            清除SV
                        </Checkbox>
                    </Col>
                </Row>
            </Modal>
        )
    }
}

class GasSettingDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            N2mv1: null,
            N2mv2: null,
            N2mv3: null,
            N2mv4: null,
            H2mv1: null,
            H2mv2: null,
            H2mv3: null,
            H2mv4: null,
        }
    }
    onRest = () => {
        this.setState({
            N2mv1: null,
            N2mv2: null,
            N2mv3: null,
            N2mv4: null,
            H2mv1: null,
            H2mv2: null,
            H2mv3: null,
            H2mv4: null,
        })
    }
    onApply = () => {
        //PulseOn("RUN.CTRL.MFC_SV", 1000) W0295.00
        //MAIN.MFC.WSV.N2_1 = CONTROL.DATA.V1
        //MAIN.MFC.WSV.N2_2 = CONTROL.DATA.V2
        //MAIN.MFC.WSV.N2_3 = CONTROL.DATA.V3
        //MAIN.MFC.WSV.N2_4 = CONTROL.DATA.V4
        //MAIN.MFC.WSV.H2_1 = CONTROL.DATA.V5
        //MAIN.MFC.WSV.H2_2 = CONTROL.DATA.V6
        //MAIN.MFC.WSV.H2_3 = CONTROL.DATA.V7
        //MAIN.MFC.WSV.H2_4 = CONTROL.DATA.V8

        window.ipcRenderer.send("plcWrite", "WB0660:00", 1)
        setTimeout(()=>{
            window.ipcRenderer.send("plcWrite", "WB0660:00", 0)
        }, 1000)
        if (this.state.N2mv1 !== null) 
            window.ipcRenderer.send("plcWrite", "D0660", this.state.N2mv1)
        if (this.state.N2mv2 !== null) 
            window.ipcRenderer.send("plcWrite", "D0670", this.state.N2mv2)
        if (this.state.N2mv3 !== null) 
            window.ipcRenderer.send("plcWrite", "D0680", this.state.N2mv3)
        if (this.state.N2mv4 !== null) 
            window.ipcRenderer.send("plcWrite", "D0690", this.state.N2mv4)
        if (this.state.H2mv1 !== null) 
            window.ipcRenderer.send("plcWrite", "D0665", this.state.H2mv1)
        if (this.state.H2mv2 !== null) 
            window.ipcRenderer.send("plcWrite", "D0675", this.state.H2mv2)
        if (this.state.H2mv3 !== null) 
            window.ipcRenderer.send("plcWrite", "D0685", this.state.H2mv3)
        if (this.state.H2mv4 !== null) 
            window.ipcRenderer.send("plcWrite", "D0695", this.state.H2mv4)
        this.onRest()
    }
    render() {
        return (
            <Drawer
                title="气体参数设置"
                width={680}
                placement="left"
                mask={true}
                closable={true}
                destroyOnClose={true}
                maskClosable={false}
                onClose={this.props.onClose}
                visible={this.props.visible}
            >
                <Row align="middle">
                    <Col flex={1}>
                        <Row align="middle" gutter={[8, 8]}>
                            <Col>
                                <Popconfirm
                                    placement="bottomLeft"
                                    title={"是否应用气体参数配置"}
                                    onConfirm={this.onApply}
                                    okText="确定"
                                    disabled={
                                        (this.state.N2mv1===null||this.state.N2mv1===PLCMemory.D[230])&&
                                        (this.state.N2mv2===null||this.state.N2mv2===PLCMemory.D[232])&&
                                        (this.state.N2mv3===null||this.state.N2mv3===PLCMemory.D[234])&&
                                        (this.state.N2mv4===null||this.state.N2mv4===PLCMemory.D[236])&&
                                        (this.state.H2mv1===null||this.state.H2mv1===PLCMemory.D[231])&&
                                        (this.state.H2mv2===null||this.state.H2mv2===PLCMemory.D[233])&&
                                        (this.state.H2mv3===null||this.state.H2mv3===PLCMemory.D[235])&&
                                        (this.state.H2mv4===null||this.state.H2mv4===PLCMemory.D[237])
                                    }
                                    cancelText="放弃"
                                >
                                    <Button
                                        type="primary"
                                        disabled={
                                            (this.state.N2mv1===null||this.state.N2mv1===PLCMemory.D[230])&&
                                            (this.state.N2mv2===null||this.state.N2mv2===PLCMemory.D[232])&&
                                            (this.state.N2mv3===null||this.state.N2mv3===PLCMemory.D[234])&&
                                            (this.state.N2mv4===null||this.state.N2mv4===PLCMemory.D[236])&&
                                            (this.state.H2mv1===null||this.state.H2mv1===PLCMemory.D[231])&&
                                            (this.state.H2mv2===null||this.state.H2mv2===PLCMemory.D[233])&&
                                            (this.state.H2mv3===null||this.state.H2mv3===PLCMemory.D[235])&&
                                            (this.state.H2mv4===null||this.state.H2mv4===PLCMemory.D[237])
                                        }
                                    >
                                        应用
                                    </Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                    </Col>
                    <Col flex={1}>
                        <Row align="middle" justify="end" gutter={[8, 8]}>
                            <Col>
                                <Button 
                                    onClick={this.onRest} 
                                    style={{float:"right"}}
                                    disabled={
                                        (this.state.N2mv1===null||this.state.N2mv1===PLCMemory.D[230])&&
                                        (this.state.N2mv2===null||this.state.N2mv2===PLCMemory.D[232])&&
                                        (this.state.N2mv3===null||this.state.N2mv3===PLCMemory.D[234])&&
                                        (this.state.N2mv4===null||this.state.N2mv4===PLCMemory.D[236])&&
                                        (this.state.H2mv1===null||this.state.H2mv1===PLCMemory.D[231])&&
                                        (this.state.H2mv2===null||this.state.H2mv2===PLCMemory.D[233])&&
                                        (this.state.H2mv3===null||this.state.H2mv3===PLCMemory.D[235])&&
                                        (this.state.H2mv4===null||this.state.H2mv4===PLCMemory.D[237])
                                    }
                                    type="primary"
                                    danger
                                >
                                    重置
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Divider orientation="center">N<sub>2</sub></Divider>
                <Descriptions title={<span>N<sub>2</sub> Bout #1~2</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[251]/10} l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.1} style={{
                                width:72,
                                backgroundColor: this.state.N2mv1===null||this.state.N2mv1===PLCMemory.D[230]?null:"#FFEBEE"
                            }}
                            value={this.state.N2mv1===null?PLCMemory.D[230]/10:this.state.N2mv1/10} 
                            onChange={value=>this.setState({N2mv1:value*10})}
                        /> l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[271]/10} %
                    </Descriptions.Item>
                </Descriptions>
                <Descriptions title={<span>N<sub>2</sub> Bout #3~4</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[253]/10} l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.1} style={{
                                width:72,
                                backgroundColor: this.state.N2mv2===null||this.state.N2mv2===PLCMemory.D[232]?null:"#FFEBEE"
                            }}
                            value={this.state.N2mv2===null?PLCMemory.D[232]/10:this.state.N2mv2/10} 
                            onChange={value=>this.setState({N2mv2:value*10})}
                        /> l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[273]/10} %
                    </Descriptions.Item>
                </Descriptions>
               <Descriptions title={<span>N<sub>2</sub> Bout #5~6</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[255]/10} l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.1} style={{
                                width:72,
                                backgroundColor: this.state.N2mv3===null||this.state.N2mv3===PLCMemory.D[234]?null:"#FFEBEE"
                            }}
                            value={this.state.N2mv3===null?PLCMemory.D[234]/10:this.state.N2mv3/10} 
                            onChange={value=>this.setState({N2mv3:value*10})}
                        /> l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[275]/10} %
                    </Descriptions.Item>
                </Descriptions>
               <Descriptions title={<span>N<sub>2</sub> Bout #7/MR</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[257]/10} cc/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.1} style={{
                                width:72,
                                backgroundColor: this.state.N2mv4===null||this.state.N2mv4===PLCMemory.D[236]?null:"#FFEBEE"
                            }}
                            value={this.state.N2mv4===null?PLCMemory.D[236]/10:this.state.N2mv4/10} 
                            onChange={value=>this.setState({N2mv4:value*10})}
                        /> cc/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[277]/10} %
                    </Descriptions.Item>
                </Descriptions>

                <Divider orientation="center">H<sub>2</sub></Divider>
                <Descriptions title={<span>H<sub>2</sub> Bout #1~2</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[252]/100} l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.01} style={{
                                width:72,
                                backgroundColor: this.state.H2mv1===null||this.state.H2mv1===PLCMemory.D[231]?null:"#FFEBEE"
                            }}
                            value={this.state.H2mv1===null?PLCMemory.D[231]/100:this.state.H2mv1/100} 
                            onChange={value=>this.setState({H2mv1:value*100})}
                        /> l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[272]/10} %
                    </Descriptions.Item>
                </Descriptions>
                <Descriptions title={<span>H<sub>2</sub> Bout #3~4</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[254]/100} l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.01} style={{
                                width:72,
                                backgroundColor: this.state.H2mv2===null||this.state.H2mv2===PLCMemory.D[233]?null:"#FFEBEE"
                            }}
                            value={this.state.H2mv2===null?PLCMemory.D[233]/100:this.state.H2mv2/100} 
                            onChange={value=>this.setState({H2mv2:value*100})}
                        /> l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[274]/10} %
                    </Descriptions.Item>
                </Descriptions>
               <Descriptions title={<span>H<sub>2</sub> Bout #5~6</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[256]/100} l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.01} style={{
                                width:72,
                                backgroundColor: this.state.H2mv3===null||this.state.H2mv3===PLCMemory.D[235]?null:"#FFEBEE"
                            }}
                            value={this.state.H2mv3===null?PLCMemory.D[235]/100:this.state.H2mv3/100} 
                            onChange={value=>this.setState({H2mv3:value*100})}
                        /> l/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[276]/10} %
                    </Descriptions.Item>
                </Descriptions>
               <Descriptions title={<span>H<sub>2</sub> Bout #7/MR</span>} bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[258]/100} cc/min
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={0.01} style={{
                                width:72,
                                backgroundColor: this.state.H2mv4===null||this.state.H2mv4===PLCMemory.D[237]?null:"#FFEBEE"
                            }}
                            value={this.state.H2mv4===null?PLCMemory.D[237]/100:this.state.H2mv4/100} 
                            onChange={value=>this.setState({H2mv4:value*100})}
                        /> cc/min
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[278]/10} %
                    </Descriptions.Item>
                </Descriptions>
            </Drawer>
        )
    }
}

class WetterSettingDrawer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            WTmv1: null,
            WTmv2: null,
            WTmv3: null,
            WTmv4: null,
            FMmv: null,
        }
    }
    onRest = () => {
        this.setState({
            WTmv1: null,
            WTmv2: null,
            WTmv3: null,
            WTmv4: null,
            FMmv: null,
        })
    }
    onApply = () => {
        if (this.state.WTmv1 !== null) 
            window.ipcRenderer.send("plcWrite", "D0516", this.state.WTmv1)
        if (this.state.WTmv2 !== null) 
            window.ipcRenderer.send("plcWrite", "D0519", this.state.WTmv2)
        if (this.state.WTmv3 !== null) 
            window.ipcRenderer.send("plcWrite", "D0510", this.state.WTmv3)
        if (this.state.WTmv4 !== null) 
            window.ipcRenderer.send("plcWrite", "D0513", this.state.WTmv4)
        if (this.state.FMmv !== null) 
            window.ipcRenderer.send("plcWrite", "D0534", this.state.FMmv)
        this.onRest();
    }
    render() {
        return (
            <Drawer
                title="加湿参数设置"
                width={680}
                placement="left"
                mask={true}
                closable={true}
                destroyOnClose={true}
                maskClosable={false}
                onClose={this.props.onClose}
                visible={this.props.visible}
            >
                <Row align="middle">
                    <Col flex={1}>
                        <Row align="middle" gutter={[8, 8]}>
                            <Col>
                                <Popconfirm
                                    placement="bottomLeft"
                                    title={"是否应用加湿参数配置"}
                                    onConfirm={this.onApply}
                                    okText="确定"
                                    disabled={
                                        (this.state.WTmv1===null||this.state.WTmv1===PLCMemory.D[516])&&
                                        (this.state.WTmv2===null||this.state.WTmv2===PLCMemory.D[519])&&
                                        (this.state.WTmv3===null||this.state.WTmv3===PLCMemory.D[510])&&
                                        (this.state.WTmv4===null||this.state.WTmv4===PLCMemory.D[513])&&
                                        (this.state.FMmv===null||this.state.FMmv===PLCMemory.D[534])
                                    }
                                    cancelText="放弃"
                                >
                                    <Button
                                        type="primary"
                                        disabled={
                                            (this.state.WTmv1===null||this.state.WTmv1===PLCMemory.D[516])&&
                                            (this.state.WTmv2===null||this.state.WTmv2===PLCMemory.D[519])&&
                                            (this.state.WTmv3===null||this.state.WTmv3===PLCMemory.D[510])&&
                                            (this.state.WTmv4===null||this.state.WTmv4===PLCMemory.D[513])&&
                                            (this.state.FMmv===null||this.state.FMmv===PLCMemory.D[534])
                                        }
                                    >
                                        应用
                                    </Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                    </Col>
                    <Col flex={1}>
                        <Row align="middle" justify="end" gutter={[8, 8]}>
                            <Col>
                                <Button 
                                    onClick={this.onRest} 
                                    style={{float:"right"}}
                                    disabled={
                                        (this.state.WTmv1===null||this.state.WTmv1===PLCMemory.D[516])&&
                                        (this.state.WTmv2===null||this.state.WTmv2===PLCMemory.D[519])&&
                                        (this.state.WTmv3===null||this.state.WTmv3===PLCMemory.D[510])&&
                                        (this.state.WTmv4===null||this.state.WTmv4===PLCMemory.D[513])&&
                                        (this.state.FMmv===null||this.state.FMmv===PLCMemory.D[534])
                                    }
                                    type="primary"
                                    danger
                                >
                                    重置
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Descriptions title="Wetter Tank #1" bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[144]} &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={1} style={{
                                width:72,
                                backgroundColor: this.state.WTmv1===null?null:"#FFEBEE"
                            }}
                            value={this.state.WTmv1===null?PLCMemory.D[516]:this.state.WTmv1} 
                            onChange={value=>this.setState({WTmv1:value})}
                        /> &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[145]/10} %
                    </Descriptions.Item>
                </Descriptions>
                <Descriptions title="Wetter Tank #2" bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[146]} &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={1} style={{
                                width:72,
                                backgroundColor: this.state.WTmv2===null?null:"#FFEBEE"
                            }}
                            value={this.state.WTmv2===null?PLCMemory.D[519]:this.state.WTmv2} 
                            onChange={value=>this.setState({WTmv2:value})}
                        /> &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[147]/10} %
                    </Descriptions.Item>
                </Descriptions>
                <Descriptions title="Wetter Tank #3" bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[140]} &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={1} style={{
                                width:72,
                                backgroundColor: this.state.WTmv3===null?null:"#FFEBEE"
                            }}
                            value={this.state.WTmv3===null?PLCMemory.D[510]:this.state.WTmv3} 
                            onChange={value=>this.setState({WTmv3:value})}
                        /> &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[141]/10} %
                    </Descriptions.Item>
                </Descriptions>
                <Descriptions title="Wetter Tank #4" bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[142]} &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={1} style={{
                                width:72,
                                backgroundColor: this.state.WTmv4===null?null:"#FFEBEE"
                            }}
                            value={this.state.WTmv4===null?PLCMemory.D[513]:this.state.WTmv4} 
                            onChange={value=>this.setState({WTmv4:value})}
                        /> &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[143]/10} %
                    </Descriptions.Item>
                </Descriptions>
                {/*<Descriptions title="Flow Meter" bordered>
                    <Descriptions.Item label="PV">
                        {PLCMemory.D[156]} &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="SV">
                        <InputNumber min={0} max={1000} step={1} style={{
                                width:72,
                                backgroundColor: this.state.FMmv===null?null:"#FFEBEE"
                            }}
                            value={this.state.FMmv===null?PLCMemory.D[534]:this.state.FMmv} 
                            onChange={value=>this.setState({FMmv:value})}
                        /> &#8451;
                    </Descriptions.Item>
                    <Descriptions.Item label="MV">
                        {PLCMemory.D[157]/10} %
                    </Descriptions.Item>
                </Descriptions>*/}
            </Drawer>
        )
    }
}

class WarmUpSettingModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            SV: 0,
            WarmUpRate: null,
            powerDetailVisible: false,
            svSetVisible: false,
        }
    }
    onShortCut = (event) => {
        if (event.code==="KeyV" && event.altKey===true) {
            console.log("keydown", event)
            this.setState({
                svSetVisible: !this.state.svSetVisible,
            })
        }
    }
    componentDidUpdate(prevProps) {
        if (prevProps.visible===false && this.props.visible===true) {
            window.addEventListener('keydown', this.onShortCut, true)
            this.setState({
                svSetVisible: false,
            })
        }
        else if (prevProps.visible===true && this.props.visible===false) {
            window.removeEventListener('keydown', this.onShortCut, true)
        }
    }
    //componentDidMount() {
    //    window.addEventListener('keydown', this.onShortCut, true)
    //}
    //componentWillUnmount() {
    //    window.removeEventListener('keydown', this.onShortCut, true)
    //}
    onClearSV = () => {
        WSV = Array(48).fill(0)
        for(let i=0;i<24;i++) {
            window.ipcRenderer.send("plcWrite", `D${i*6+300}`, 0) //clear left SV
            window.ipcRenderer.send("plcWrite", `D${i*6+303}`, 0) //clear right SV
        }
    }
    onSetSV = () => {
        WSV = Array(48).fill(this.state.SV)
        for(let i=0;i<24;i++) {
            window.ipcRenderer.send("plcWrite", `D${i*6+300}`, this.state.SV) //set left SV
            window.ipcRenderer.send("plcWrite", `D${i*6+303}`, this.state.SV) //set right SV
        }
    }
    render() {
        return (
            <Drawer
                title="升温管理"
                placement="bottom"
                size="small"
                height={this.state.powerDetailVisible?348:141}
                mask={false}
                closable={true}
                destroyOnClose={true}
                maskClosable={false}
                onClose={() => {
                    this.props.onCancel()
                }}
                visible={this.props.visible}
                bodyStyle={{paddingBottom:0}}
            >
                <Row>
                    <Col flex={1}>
                        <Row align="middle" gutter={[8,8]}>
                            <Col>
                                <Typography.Title level={5} style={{margin:0}}>主加热</Typography.Title>
                            </Col>
                            <Col>
                                <Switch 
                                    checkedChildren="ON"
                                    unCheckedChildren="OFF"
                                    checked={(PLCMemory.W[290]&1)===1}
                                    onChange={(value)=>{
                                        //console.log("Main heating switch", value);
                                        window.ipcRenderer.send("plcWrite", "WB0290:00", value?1:0)
                                    }}
                                />
                            </Col>
                            <Col>
                                <Progress type="circle" percent={this.props.second/59*100} format={percent => `${this.props.second}s`} width={30} />
                            </Col>
                            <Col span={1}></Col>
                            <Col>
                                <Typography.Title level={5} style={{margin:0}}>升温率</Typography.Title>
                            </Col>
                            <Col>
                                <InputNumber value={this.state.WarmUpRate===null?WarmUpRate:this.state.WarmUpRate} min={0} max={10} step={0.1}
                                    onChange={(value)=>{this.setState({WarmUpRate:value})}}
                                    style={{backgroundColor:this.state.WarmUpRate!==null&&this.state.WarmUpRate!==WarmUpRate?"#FFEBEE":null}}
                                />
                            </Col>
                            <Col>
                                <Typography.Title level={5} style={{margin:0}}>&#8451;/min</Typography.Title>
                            </Col>
                            <Col>
                                <Button 
                                    disabled={this.state.WarmUpRate===null||this.state.WarmUpRate===WarmUpRate}
                                    onClick={()=>{
                                        if(this.state.WarmUpRate!==null)
                                            WarmUpRate = this.state.WarmUpRate
                                    }} 
                                    type="primary"
                                >
                                    应用
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    disabled={this.state.WarmUpRate===null||this.state.WarmUpRate===WarmUpRate}
                                    onClick={()=>{
                                        this.setState({
                                            WarmUpRate: null
                                        })
                                    }} 
                                    type="primary"
                                    danger
                                >
                                    重置
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                    <Col flex={1}>
                        <Row  align="middle" justify="end" gutter={[4,4]}>
                            {this.state.svSetVisible?
                            <Col>
                                <InputNumber value={this.state.SV} min={0} max={900} step={1}
                                    onChange={(value)=>{this.setState({SV:value})}}
                                />
                                <Popconfirm
                                    placement="topLeft"
                                    title={"是否设置SV"}
                                    onConfirm={this.onSetSV}
                                    okText="确定"
                                    cancelText="放弃"
                                >
                                    <Button type="primary">设置SV</Button>
                                </Popconfirm>
                            </Col>:null}
                            <Col>
                                <Popconfirm
                                    placement="topLeft"
                                    title={"是否清除SV"}
                                    onConfirm={this.onClearSV}
                                    okText="确定"
                                    cancelText="放弃"
                                >
                                    <Button type="primary" danger>清除SV</Button>
                                </Popconfirm>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Divider style={{display: this.state.powerDetailVisible?null:"none"}} orientation="center">加热功率</Divider>
                <Row align="middle" justify="center" style={{display: this.state.powerDetailVisible?null:"none"}}>
                    {Array(24).fill(0).map((d, index)=>(
                        <Col flex={1} key={index}>
                            <Row align="bottom" justify="space-around" style={{padding:0}}>
                                <Col span={24}>
                                    <Progress type="dashboard" percent={PLCMemory.D[index*4+1]/10} width={45} format={percent=>`${percent}%`}/>
                                </Col>
                            </Row>
                            <Row align="top" justify="space-around" style={{padding:0}} gutter={[0, 16]}>
                                <Col span={24} style={{textAlign:"center", }}>
                                    <b style={{marginRight:4}}>{`L${index+1}`}</b>
                                </Col>
                            </Row>
                            <Row align="bottom" justify="space-around" style={{padding:0}}>
                                <Col span={24}>
                                    <Progress type="dashboard" percent={PLCMemory.D[index*4+3]/10} width={45} format={percent=>`${percent}%`}/>
                                </Col>
                            </Row>
                            <Row align="top" justify="space-around" style={{padding:0}}>
                                <Col span={24} style={{textAlign:"center", }}>
                                    <b style={{marginRight:4}}>{`R${index+1}`}</b>
                                </Col>
                            </Row>
                        </Col>
                    ))}
                </Row>
                <Row align="bottom" justify="center" style={{padding:0}}>
                    <Col>
                        <Icon component={openUpSvg}
                            rotate={this.state.powerDetailVisible?180:0}
                            onClick={()=>{this.setState({
                                powerDetailVisible: !this.state.powerDetailVisible
                            })}}
                        /> 
                    </Col>
                </Row>
            </Drawer>
        )
    }
}

class ZoneTSVSettingModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            conveyor: null,
            clearSVOnApply: false,
            ...Array(24).fill(0).reduce((obj, entry, index) => {
                obj[`L${index+1}`] = null;
                obj[`R${index+1}`] = null;
                return obj;
            }, {})
        }
    }
    changeHandle = (reg, value) => {
        this.setState({
            [reg]: value
        })
    }
    onApply = () => {
        if(this.state.clearSVOnApply)
            WSV = Array(48).fill(0);
        for(let i=0;i<24;i++) {
            if(this.state[`L${i+1}`]!==null) {
                window.ipcRenderer.send("plcWrite", `D${i*2+800}`, this.state[`L${i+1}`]) //set TSV
                if(this.state.clearSVOnApply)
                    window.ipcRenderer.send("plcWrite", `D${i*6+300}`, 0) //clear SV
            }
            if(this.state[`R${i+1}`]!==null) {
                window.ipcRenderer.send("plcWrite", `D${i*2+801}`, this.state[`R${i+1}`]) //set TSV
                if(this.state.clearSVOnApply)
                    window.ipcRenderer.send("plcWrite", `D${i*6+303}`, 0) //clear SV
            }
        }
        if(this.state.conveyor!==null)
            window.ipcRenderer.send("plcWrite", "D0640", Math.round(this.state.conveyor * 4000 / 310.3/1.5))
    }
    onRead = () => {
        readConfigFile()
            .then((data) => {
                //console.log(data)
                this.setState({
                    ...data.data,
                })
            })
    }
    onSave = () => {
        writeConfigFile({
            ...Array(24).fill(0).reduce((obj, entry, index) => {
                obj[`L${index+1}`] = this.state[`L${index+1}`]!==null?this.state[`L${index+1}`]:PLCMemory.D[index*2+800];
                obj[`R${index+1}`] = this.state[`R${index+1}`]!==null?this.state[`R${index+1}`]:PLCMemory.D[index*2+801];
                return obj;
            }, {conveyor: this.state.conveyor===null?Math.round(PLCMemory.D[292] * 310.3 / 4000*10)/10:this.state.conveyor})
        })
    }
    render() {
        return (
            <Drawer
              title="运行参数管理"
              placement="left"
              size="small"
              width={600}
              closable={true}
              destroyOnClose={true}
              maskClosable={false}
              onClose={() => {
                this.setState({
                    conveyor: null,
                    ...Array(24).fill(0).reduce((obj, entry, index) => {
                        obj[`L${index+1}`] = null;
                        obj[`R${index+1}`] = null;
                        return obj;
                    }, {})
                })
                this.props.onCancel()
              }}
              visible={this.props.visible}
            >
                <Row align="middle">
                    <Col flex={1}>
                        <Row align="middle" gutter={[8, 8]}>
                            <Col>
                                <Button
                                    type="primary"
                                    danger
                                    onClick={()=>{
                                        this.setState({
                                            conveyor: null,
                                            ...Array(24).fill(0).reduce((obj, entry, index) => {
                                                obj[`L${index+1}`] = null;
                                                obj[`R${index+1}`] = null;
                                                return obj;
                                            }, {})
                                        })
                                    }}
                                >
                                    重置
                                </Button>
                            </Col>
                            <Col>
                                <Popconfirm
                                    placement="bottomLeft"
                                    title={"是否应用配置"}
                                    onConfirm={this.onApply}
                                    okText="确定"
                                    cancelText="放弃"
                                >
                                    <Button type="primary">应用</Button>
                                </Popconfirm>
                            </Col>
                            <Col>
                                <Checkbox checked={this.state.clearSVOnApply} onChange={(e)=>{this.setState({clearSVOnApply:e.target.checked})}}>清除SV</Checkbox>
                            </Col>
                        </Row>
                    </Col>
                    <Col flex={1}>
                        <Row align="middle" justify="end" gutter={[8, 8]}>
                            <Col>
                                <Button 
                                    onClick={this.onRead} 
                                    style={{float:"right"}}
                                    type="primary"
                                >
                                    读取
                                </Button>
                            </Col>
                            <Col>
                                <Button 
                                    onClick={this.onSave} 
                                    style={{float:"right"}}
                                    type="primary"
                                >
                                    保存
                                </Button>
                            </Col>
                        </Row>
                    </Col>
                </Row>
                <Divider orientation="center">传送带</Divider>
                <Row align="middle" gutter={[8, 8]}>
                    <Col span={6}>
                        <Typography.Title level={5} style={{margin:0}}>传送带速度</Typography.Title>
                    </Col>
                    <Col>
                        <InputNumber min={0} max={500} step={0.1} 
                            value={this.state.conveyor===null?Math.round(PLCMemory.D[292] * 310.3 / 4000*10)/10:this.state.conveyor} 
                            onChange={(value) => {
                                this.setState({
                                    conveyor: value
                                })
                            }}
                        />
                    </Col>
                    <Col>
                        <Typography.Title level={4} style={{margin:0}}>mm/min</Typography.Title>
                    </Col>
                </Row>
                <Divider orientation="center">温区</Divider>
                <Row gutter={[8, 8]}>
                    <Col>
                        <Button 
                            onClick={()=>{
                                let tempTemp = {...this.state}
                                for(let i=0;i<24;i++) {
                                    if (tempTemp[`L${i+1}`]===null) {
                                        tempTemp[`R${i+1}`] = PLCMemory.D[i*2+800]
                                    }
                                    else {
                                        tempTemp[`R${i+1}`] = tempTemp[`L${i+1}`]
                                    }
                                }
                                this.setState({
                                    ...tempTemp
                                })
                            }}
                        >
                            Lx => Rx
                        </Button>
                    </Col>
                    <Col>
                        <Button 
                            onClick={()=>{
                                let tempTemp = {...this.state}
                                for(let i=0;i<24;i++) {
                                    if (tempTemp[`L1`]===null) {
                                        tempTemp[`R${i+1}`] = PLCMemory.D[800]
                                        tempTemp[`L${i+1}`] = PLCMemory.D[800]
                                    }
                                    else {
                                        tempTemp[`L${i+1}`] = tempTemp[`L1`]
                                        tempTemp[`R${i+1}`] = tempTemp[`L1`]
                                    }
                                }
                                this.setState({
                                    ...tempTemp
                                })
                            }}
                        >
                            L1 => ALL
                        </Button>
                    </Col>
                </Row>
                <Descriptions layout="horizontal" column={2} bordered>
                    {Array(24).fill(0).map((value, index)=>(
                        <Fragment key={index}>
                        <Descriptions.Item label={`L${index+1}`}>
                            <InputNumber min={0} max={900} step={1} 
                                value={this.state[`L${index+1}`]!==null?this.state[`L${index+1}`]:PLCMemory.D[index*2+800]} 
                                style={{width:120}} 
                                onChange={(value)=>{this.changeHandle(`L${index+1}`, value)}}
                            />
                        </Descriptions.Item>
                        <Descriptions.Item label={`R${index+1}`}>
                            <InputNumber min={0} max={900} step={1} 
                                value={this.state[`R${index+1}`]!==null?this.state[`R${index+1}`]:PLCMemory.D[index*2+801]}
                                style={{width:120}} 
                                onChange={(value)=>{this.changeHandle(`R${index+1}`, value)}}
                            />
                        </Descriptions.Item>
                        </Fragment>
                    ))}
                </Descriptions>
            </Drawer>
        )
    }
}

class ZoneSetting extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sv: null
        }
    }
    render() {
        let pvMatches = this.props.pv.match(/([A-Z]*)([0-9]*):?([0-9]*)/)
        let pvAddr = +pvMatches[2]
        //let pvBit = +pvMatches[3]
        let svMatches = this.props.sv.match(/([A-Z]*)([0-9]*):?([0-9]*)/)
        let svAddr = +svMatches[2]
        //let svBit = +svMatches[3]
        return (
            <>
            <Row align="middle" gutter={[8, 8]}>
                <Col flex={1}>
                    <Typography.Title level={4} style={{margin:0}}>PV</Typography.Title>
                </Col>
                <Col flex={3}>
                    <InputNumber 
                        readOnly
                        value={PLCMemory[this.props.pv[0]][pvAddr]}
                        onChange={(value)=>{
                            this.setState({
                                sv:value
                            })
                        }}
                        style={{width:60, backgroundColor:"#e0e0e0"}}
                    />
                </Col>
                <Col flex={1}>
                    <Typography.Title level={4} style={{margin:0}}>&#8451;</Typography.Title>
                </Col>
            </Row>
            <Row align="middle" gutter={[8, 8]}>
                <Col flex={1}>
                    <Typography.Title level={4} style={{margin:0}}>SV</Typography.Title>
                </Col>
                <Col flex={3}>
                    <InputNumber 
                        min={0} 
                        max={900} 
                        value={this.state.sv===null?PLCMemory[this.props.sv[0]][svAddr]:this.state.sv}
                        onChange={(value)=>{
                            this.setState({
                                sv:value
                            })
                        }}
                        style={{width:60}}
                    />
                </Col>
                <Col flex={1}>
                    <Typography.Title level={4} style={{margin:0}}>&#8451;</Typography.Title>
                </Col>
            </Row>
            </>
        )
    }
}

class ZoneSettingModal extends React.Component {
    render() {
        return (
            <Modal
                title="温区设置"
                visible={this.props.visible}
                okButtonProps={{style:{display:"none"}}}
                cancelText="关闭"
                onCancel={this.props.onCancel}
            >
                <ZoneSetting pv="D0000" sv="D0300" />
            </Modal>
        )
    }
}

class StateIcon extends React.Component {
    render() {
        //const bgColor = {RUN:"#81C784", STOP:"#BDBDBD"}
        return (
            <div style={{border: `solid ${this.props.run?"#00E676":"#E0E0E0"}`, borderRadius:8, padding:5, backgroundColor:"black"}}>
                <Icon component={this.props.component} style={{fontSize: '40px', color:this.props.run?"#00E676":"#E0E0E0"}} rotate={this.props.rotate} />
            </div>
        )
    }
}

class ConveyorSettingModal extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            sv: 0
        }
    }

    render() {
        return (
            <Modal
                title="传送带设置"
                visible={this.props.visible}
                okButtonProps={{style:{display:"none"}}}
                cancelText="关闭"
                onCancel={this.props.onCancel}
                afterClose={()=>{this.setState({
                    sv:0
                })}}
            >
                <div style={{padding:20}}>
                    <Row>
                        <Col span={18}>
                            <Row align="middle" gutter={[36, 18]}>
                                <Col span={4}>
                                    PV
                                </Col>
                                <Col span={8}>
                                    <InputNumber min={0} max={500} step={0.1} value={Math.round(PLCMemory.D[292] * 310.3 / 4000*10)/10} readOnly style={{width:"100%", textAlign:"right"}} />
                                </Col>
                                <Col span={8}>
                                     mm/min
                                </Col>
                            </Row>
                            <Row align="middle" gutter={[36, 18]}>
                                <Col span={4}>
                                    SV
                                </Col>
                                <Col span={8}>
                                    <InputNumber min={0} max={500} step={0.1} value={this.state.sv===0?Math.round(PLCMemory.D[640] * 310.3 / 4000*10*1.5)/10:this.state.sv} style={{width:"100%", textAlign:"right"}} onChange={(value)=>{this.setState({sv:value})}}/>
                                </Col>
                                <Col span={8}>
                                     mm/min
                                </Col>
                            </Row>
                        </Col>
                        <Col span={6}>
                            <Row align="middle" gutter={[36, 18]}>
                                <Col>
                                    <Button 
                                        onClick={()=>{window.ipcRenderer.send("plcWrite", "D0640", Math.round(this.state.sv * 4000 / 310.3/1.5))}} 
                                        style={{width:80, height:80}}
                                        type="primary"
                                    >
                                        应用
                                    </Button>
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div>
            </Modal>
        )
    }
}

class IconDisplayer extends React.Component {
    render() {
        let matches = this.props.address.match(/([A-Z]*)([0-9]*):?([0-9]*)/)
        let addr = +matches[2]
        let bit = +matches[3]
        return (
            <>
            <Col>
                <StateIcon
                    component={this.props.icon}
                    run={(PLCMemory[this.props.address[0]][addr]&(1<<bit))===(1<<bit)} 
                    rotate={this.props.rotate?this.props.rotate:0}
                />
            </Col>
            <Col flex={1}>
                <Typography.Title level={4} style={{margin:0}}>{this.props.label}</Typography.Title>
            </Col>
            </>
        )
    }
}

//class IconControllor extends React.Component {
//    render() {
//        let matches = this.props.address.match(/([A-Z]*)([0-9]*):?([0-9]*)/)
//        let addr = +matches[2]
//        let bit = +matches[3]
//        return (
//            <>
//            <Row align="middle" gutter={[36, 0]}>
//                <Col>
//                    <StateIcon 
//                        component={this.props.icon} 
//                        run={(PLCMemory[this.props.address[0]][addr]&(1<<bit))===(1<<bit)} 
//                        rotate={this.props.rotate?this.props.rotate:0}
//                    />
//                </Col>
//                <Col flex="auto">
//                    <Switch 
//                        checkedChildren="ON"
//                        unCheckedChildren="OFF"
//                        checked={(PLCMemory[this.props.address[0]][addr]&(1<<bit))===(1<<bit)}
//                        onChange={(value)=>{
//                            //console.log("Main heating switch", value);
//                            window.ipcRenderer.send("plcWrite", this.props.address, value?1:0)
//                        }}
//                    />
//                </Col>
//            </Row>
//            <Row gutter={[36, 18]}>
//                <Col>
//                    {this.props.label}
//                </Col>
//            </Row>
//            </>  
//        )
//    }
//}

class ControlModal extends React.Component{
    render() {
        return (
            <Modal
                title="设备操控"
                visible={this.props.visible}
                okButtonProps={{style:{display:"none"}}}
                cancelText="关闭"
                onCancel={this.props.onCancel}
            >
                    <Row>
                        <Col span={12}>
                            <Row align="middle" gutter={[36, 18]}>
                                <Col><StateIcon component={HeatingSvg} run={(PLCMemory.W[290]&1)===1}/> 主加热</Col>
                                <Col flex="auto">
                                    <Switch 
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                        checked={(PLCMemory.W[290]&1)===1}
                                        onChange={(value)=>{
                                            //console.log("Main heating switch", value);
                                            window.ipcRenderer.send("plcWrite", "WB0290:00", value?1:0)
                                        }}
                                        style={{marginBottom:18}}
                                    />
                                </Col>
                            </Row>
                            <Row align="middle" gutter={[36, 18]}>
                                <Col><StateIcon component={ConveyorSvg} run={(PLCMemory.W[291]&0x10)===0x10}/> 传送带</Col>
                                <Col flex="auto">
                                    <Switch 
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                        checked={(PLCMemory.W[291]&0x10)===0x10}
                                        onChange={(value)=>{
                                            //console.log("Conveyor switch", value);
                                            window.ipcRenderer.send("plcWrite", "WB0291:04", value?1:0)
                                        }}
                                        style={{marginBottom:18}}
                                    />
                                </Col>
                            </Row>
                            {/*<Row align="middle" gutter={[36, 18]}>
                                <Col><StateIcon component={SoundSvg} run={(PLCMemory.W[311]&0x2)===0x2} rotate={90}/> 超声波</Col>
                                <Col flex="auto">
                                    <Switch 
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                        checked={(PLCMemory.W[311]&0x2)===0x2}
                                        onChange={(value)=>{
                                            //console.log("Sonic switch", value);
                                            window.ipcRenderer.send("plcWrite", "WB0311:01", value?1:0)
                                        }}
                                        style={{marginBottom:18}}
                                    />
                                </Col>
                            </Row>
                            <IconControllor address="WB0291:12" icon={pumpSvg} label="风淋PUMP" rotate={90}/>
                            <IconControllor address="WB0291:13" icon={pumpSvg} label="入口排水" rotate={90}/>*/}
                        </Col>
                        <Col span={12}>
                            <Row align="middle" gutter={[36, 18]}>
                                <Col><StateIcon component={ValveSvg} run={(PLCMemory.W[292]&0x1)===0x1}/>N<sub>2</sub>气体</Col>
                                <Col flex="auto">
                                    <Switch 
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                        checked={(PLCMemory.W[292]&0x1)===0x1}
                                        onChange={(value)=>{
                                            //console.log("N2 switch", value);
                                            window.ipcRenderer.send("plcWrite", "WB0292:00", value?1:0)
                                        }}
                                        style={{marginBottom:18}}
                                    />
                                </Col>
                            </Row>
                            <Row align="middle" gutter={[36, 18]}>
                                <Col><StateIcon component={ValveSvg} run={(PLCMemory.W[291]&0x8000)===0x8000}/>H<sub>2</sub>气体</Col>
                                <Col flex="auto">
                                    <Switch 
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                        checked={(PLCMemory.W[291]&0x8000)===0x8000}
                                        onChange={(value)=>{
                                            //console.log("H2 switch", value);
                                            window.ipcRenderer.send("plcWrite", "WB0291:15", value?1:0)
                                        }}
                                        style={{marginBottom:18}}
                                    />
                                </Col>
                            </Row>
                            {/*
                            <Row align="middle" gutter={[36, 18]}>
                                <Col><StateIcon component={ValveSvg} run={(PLCMemory.W[311]&0x10)===0x10}/>SonicAir</Col>
                                <Col flex="auto">
                                    <Switch 
                                        checkedChildren="ON"
                                        unCheckedChildren="OFF"
                                        checked={(PLCMemory.W[311]&0x10)===0x10}
                                        onChange={(value)=>{
                                            //console.log("Sonic air switch", value);
                                            window.ipcRenderer.send("plcWrite", "WB0311:04", value?1:0)
                                        }}
                                        style={{marginBottom:18}}
                                    />
                                </Col>
                            </Row>
                            */}
                        </Col>
                    </Row>
            </Modal>
        )
    }
}

class TemplateTable extends React.Component{
    render() {
        //let data = Object.keys(this.props.data).map((k, i)=>(
        //    {
        //        name: k,
        //        ...this.props.data[k]
        //    }
        //))
        let columns = [];
        if (this.props.data) {
            columns = Object.keys(this.props.data[0]).filter((k)=>(k!=='name')).map((k, index)=>({
                title: k,
                align: 'right',
                dataIndex: k,
                key: k,
                className: index%2===0?"table-col-light":"table-col-dark",
            }))
        }
        columns = [{
            title: ' ',
            dataIndex: 'name',
            className:"table-col-title"
            }].concat(columns);
        //let columns = [
        //    {
        //        title: 'Zone',
        //        dataIndex: 'name',
        //    },
        //    {
        //        title: 'TSV',
        //        align: 'right',
        //        dataIndex: 'TSV',
        //    },
        //    {
        //        title: 'SV',
        //        align: 'right',
        //        dataIndex: 'SV',
        //    },
        //    {
        //        title: 'PV',
        //        align: 'right',
        //        dataIndex: 'PV',
        //    },
        //    {
        //        title: 'MV',
        //        align: 'right',
        //        dataIndex: 'MV',
        //    }
        //]
        return (
            <Table
                bordered={true}
                columns={columns}
                rowKey={record => record.name}
                dataSource={this.props.data}
                size={'small'}
                pagination={false}
                tableLayout={'fixed'}
            />
        );
    }
}

class ChartWrapper extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            containerWidth: null,
            containerHeight: null
        }
        this.refCom = React.createRef()
        this.fitParentContainer = this.fitParentContainer.bind(this)
    }
    componentDidMount() {
      this.fitParentContainer()
      window.addEventListener('resize', this.fitParentContainer)
    }

    componentWillUnmount() {
      window.removeEventListener('resize', this.fitParentContainer)
    }
    fitParentContainer() {
      const { containerWidth, containerHeight } = this.state
      const currentContainerWidth = this.refCom.current.offsetWidth
      const currentContainerHeight = this.refCom.current.offsetHeight
      const shouldResize = containerWidth !== currentContainerWidth || containerHeight !== currentContainerHeight 
      if (shouldResize) {
        this.setState({
          containerWidth: currentContainerWidth,
          containerHeight: currentContainerHeight
        })
      }
    }
    
    render() {
      const { containerWidth, containerHeight } = this.state
      //console.log("ChartWrapper", containerWidth, containerHeight)
      const shouldRenderChart = containerWidth !== null && containerHeight !== null
      const childrenWithProps = React.Children.map(this.props.children, child => 
            React.cloneElement(child, { parentWidth: containerWidth, parentHeight: containerHeight })
      );
      return (
        <div ref={this.refCom} className="Responsive-wrapper" >
          {shouldRenderChart && childrenWithProps}
        </div>
      )
    }
}

class TempChart extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: []
        }
        //this.ref = React.CreateRef()
    }
    componentDidMount() {
        this.draw();
    }
    componentDidUpdate() {
        this.draw();
    }
    draw = () => {
        var data = this.props.data
        data = data.sort((a, b) => (
            +a.name.slice(1)>+b.name.slice(1)?1:(+a.name.slice(1)===+b.name.slice(1)?0:-1)
        ))
        const margin = {top: 10, right: 10, bottom: 10, left: 30}
        const width = this.props.parentWidth - margin.left - margin.right,
            height = 170 - margin.top - margin.bottom
        d3.select(this.refs.tempcanvas).select("svg").remove();
        const svg = d3.select(this.refs.tempcanvas).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom + 20)
            //.style("border", "1px solid black")
            .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
        const x = d3.scaleBand()
            .domain(d3.range(24))
            .range([0, width])
            .padding(0.05)
        const y = d3.scaleLinear()
            .domain([Math.min(d3.min(data, d=>d.PV), d3.min(data, d=>d.TSV), d3.min(data, d=>d.SV)), Math.max(d3.max(data, d => d.PV), d3.max(data, d=>d.TSV))])
            .nice()
            .range([height, 0])
        const xAxis = d3.axisBottom(x).tickFormat(i => data[i].name)
        const yAxis = d3.axisLeft(y)
        svg.append("g")
            .attr("transform", "translate(0," + (height + 10) + ")")
            .call(xAxis);
        svg.append("g")
            .call(yAxis);
        var PVLine = d3.line()
            .x((d, i) => x(i)+x.bandwidth()/2)
            .y((d) => y(d.PV))
            .curve(d3.curveMonotoneX);
        svg.append("path")
            .data([data])
            .style("fill", "none")
            .style("stroke", "rgba(255, 171, 0, 0.5)")
            .style("stroke-width", "2")
            .attr("class", "PVLine")
            .attr("d", PVLine)
        var TSVLine = d3.line()
            .x((d, i) => x(i)+x.bandwidth()/2)
            .y((d) => y(d.TSV))
            .curve(d3.curveMonotoneX);
        svg.append("path")
            .data([data])
            .style("fill", "none")
            .style("stroke", "rgba(187, 222, 251, 0.5)")
            .style("stroke-width", "1")
            .attr("class", "TSVLine")
            .attr("d", TSVLine)
        var SVLine = d3.line()
            .x((d, i) => x(i)+x.bandwidth()/2)
            .y((d) => y(d.SV))
            .curve(d3.curveMonotoneX);
        svg.append("path")
            .data([data])
            .style("fill", "none")
            .style("stroke", "rgba(255, 171, 0, 0.5)")
            .style("stroke-dasharray", "4, 4")
            .style("stroke-width", "1")
            .attr("class", "SVLine")
            .attr("d", SVLine)
        svg.selectAll(".dot")
            .data(data)
            .enter()
            .append("circle")
            .style("fill", "#00abff")
            .style("stroke", "#00abff")
            .attr("cx", (d, i)=>(x(i)+x.bandwidth()/2))
            .attr("cy", (d, i)=>(y(d.PV)))
            .attr("r", 1.5)
    }
    render() {
        return <div className="TempChart" ref="tempcanvas" />
    }

}
//function App() {
    //useEffect( () => {
    //    window.ipcRenderer.on('ping', (event, message) => { 
    //        console.log(message) 
    //    });
    //            
    //}, []);
    //useEffect( () => {
    //    window.ipcRenderer.on('plcReaded', (event, message) => { 
    //        console.log(message) 
    //    });
    //}, []);
    //useEffect( () => {
    //    window.ipcRenderer.on('plcReply', (event, message) => { 
    //        console.log(message) 
    //    });
    //}, []);
    //window.ipcRenderer.send("plcRead", "D0000", 10)

//const DContext = React.createContext(Array(2500).fill(0));
//const WContext = React.createContext(Array(350).fill(0));
//const CContext = React.createContext(Array(12).fill(0));

//                    <Row align="middle" gutter={[8, 8]}>
//                        <Col span={24}>
//                            <Card bodyStyle={{padding:12}}>
//                            <Statistic
//                                title="Flow Meter" 
//                                value={PLCMemory.D[156]}
//                                suffix={<span> / {PLCMemory.D[534]} &#8451;</span>}
//                            />
//                            </Card>
//                        </Col>
//                    </Row>

class MainInfoTable extends React.Component {
    render() {
        return (
            <div style={{padding: 8}}>
            <Row align="top" gutter={[16, 0]}>
                <Col span={8}>
                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={24}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title="Conveyor Speed" 
                                value={Math.round(PLCMemory.D[292]*310.3/400)/10}
                                suffix={<span> / {Math.round(PLCMemory.D[640] * 310.3 / 400*1.5)/10} mm/min</span>}
                            />
                            </Card>
                        </Col>
                    </Row>

                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>O<sub>2</sub> Analyzer</span>} 
                                value={Math.round((PLCMemory.D[290]*0.025-0.2)*10)/10}
                                suffix=" ppm"
                            />
                            </Card>
                        </Col>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>H<sub>2</sub> Analyzer</span>} 
                                value={Math.round((PLCMemory.D[291]*0.00125-0.04)*100)/100}
                                suffix=" vol/%"
                            />
                            </Card>
                        </Col>
                    </Row>
                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title="Wetter #1" 
                                value={PLCMemory.D[144]}
                                suffix={<span> / {PLCMemory.D[516]}</span>}
                            />
                            </Card>
                        </Col>
                         <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title="Wetter #2"
                                value={PLCMemory.D[146]}
                                suffix={<span> / {PLCMemory.D[519]}</span>}
                            />
                            </Card>
                        </Col>
                    </Row>
                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title="Wetter #3"
                                value={PLCMemory.D[140]}
                                suffix={<span> / {PLCMemory.D[510]}</span>}
                            />
                            </Card>
                        </Col>
                         <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title="Wetter #4"
                                value={PLCMemory.D[142]}
                                suffix={<span> / {PLCMemory.D[513]}</span>}
                            />
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>N<sub>2</sub> Bout 1~2</span>} 
                                value={Math.round(PLCMemory.D[251])}
                                suffix={<span> / {Math.round(PLCMemory.D[230])}</span>}
                            />
                            </Card>
                        </Col>
                         <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>H<sub>2</sub> Bout 1~2</span>} 
                                value={Math.round(PLCMemory.D[252])/100}
                                suffix={<span> / {Math.round(PLCMemory.D[231])/100}</span>}
                            />
                            </Card>
                        </Col>
                    </Row>
                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>N<sub>2</sub> Bout 3~4</span>} 
                                value={Math.round(PLCMemory.D[253])}
                                suffix={<span> / {Math.round(PLCMemory.D[232])}</span>}
                            />
                            </Card>
                        </Col>
                         <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>H<sub>2</sub> Bout 3~4</span>} 
                                value={Math.round(PLCMemory.D[254])/100}
                                suffix={<span> / {Math.round(PLCMemory.D[233])/100}</span>}
                            />
                            </Card>
                        </Col>
                    </Row>
                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>N<sub>2</sub> Bout 5~6</span>} 
                                value={Math.round(PLCMemory.D[255])}
                                suffix={<span> / {Math.round(PLCMemory.D[234])}</span>}
                            />
                            </Card>
                        </Col>
                         <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>H<sub>2</sub> Bout 5~6</span>} 
                                value={Math.round(PLCMemory.D[256])/100}
                                suffix={<span> / {Math.round(PLCMemory.D[235])/100}</span>}
                            />
                            </Card>
                        </Col>
                    </Row>
                    <Row align="middle" gutter={[8, 8]}>
                        <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>N<sub>2</sub> Bout 7/MR</span>} 
                                value={Math.round(PLCMemory.D[257])}
                                suffix={<span> / {Math.round(PLCMemory.D[236])}</span>}
                            />
                            </Card>
                        </Col>
                         <Col span={12}>
                            <Card bodyStyle={{padding:"12px 36px"}}>
                            <Statistic
                                title={<span>H<sub>2</sub> Bout 7/MR</span>} 
                                value={Math.round(PLCMemory.D[258])/100}
                                suffix={<span> / {Math.round(PLCMemory.D[237])/100}</span>}
                            />
                            </Card>
                        </Col>
                    </Row>
                </Col>
                <Col span={8}>
                    {Array(4).fill(0).map((d, index)=>(
                    <Row align="middle" gutter={[8, 8]} key={index}>
                        <Col span={6}>
                            <Card bodyStyle={{padding:"12px 12px"}}>
                            <Statistic
                                title={`Eject L${index*2+1}`}
                                value={PLCMemory.D[112+index*8]}
                            />
                            </Card>
                        </Col>
                        {index===3?
                        <Col span={6}>

                        </Col>:
                        <Col span={6}>
                            <Card bodyStyle={{padding:"12px 12px"}}>
                            <Statistic
                                title={`Eject L${index*2+2}`}
                                value={PLCMemory.D[116+index*8]}
                            />
                            </Card>
                        </Col>
                        }
                        <Col span={6}>
                            <Card bodyStyle={{padding:"12px 12px"}}>
                            <Statistic
                                title={`Eject R${index*2+1}`}
                                value={PLCMemory.D[114+index*8]}
                            />
                            </Card>
                        </Col>
                        {index===3?
                        <Col span={6}>

                        </Col>:
                        <Col span={6}>
                            <Card bodyStyle={{padding:"12px 12px"}}>
                            <Statistic
                                title={`Eject R${index*2+2}`}
                                value={PLCMemory.D[118+index*8]}
                            />
                            </Card>
                        </Col>
                        }
                    </Row>
                    ))}
                </Col>
            </Row>
            </div>
        )
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        //console.log("constructor")
        this.state = {
            //D: Array(2500).fill(0),
            //W: Array(350).fill(0),
            //C: Array(12).fill(0),
            //ltempZone: {},
            //rtempZone: {},
            controlVisible: false,
            conveyorSettingVisible: false,
            zoneSettingVisible: false,
            zoneTSVSettingVisible: false,
            warmUpSettingVisible: false,
            wetterSettingVisible: false,
            gasSettingVisible: false,
            loadingStart: false,
            alarmVisible: false,
            warmUpSecond: 0,
        };
        this.warmUpIntervalTimer = null
    }

    SFMainStart = () => {
        window.ipcRenderer.send("plcWrite", "WB0290:00", 1)
        window.ipcRenderer.send("plcWrite", "WB0291:04", 1)
        //window.ipcRenderer.send("plcWrite", "WB0311:01", 1)
    }
    SFMainStop = () => {
        window.ipcRenderer.send("plcWrite", "WB0290:00", 0)
        window.ipcRenderer.send("plcWrite", "WB0291:04", 0)
        //window.ipcRenderer.send("plcWrite", "WB0311:01", 0)
    }
    SFWarmUp = () => {
        let {warmUpSecond} = this.state
        warmUpSecond = (warmUpSecond + 1) % 60
        this.setState({
            warmUpSecond: warmUpSecond
        })
        if(warmUpSecond === 0) {
            if ((PLCMemory.W[290]&1)===1) {
                for(let i=0;i<24;i++) {
                    if (PLCMemory.D[i*2+800] > WSV[i*2] + WarmUpRate) {
                        WSV[i*2] += WarmUpRate
                    }
                    else {
                        WSV[i*2] = PLCMemory.D[i*2+800]
                    }
                    if (PLCMemory.D[i*6+300] !== WSV[i*2])
                        window.ipcRenderer.send("plcWrite", `D${i*6+300}`, WSV[i*2])

                    if (PLCMemory.D[i*2+801] > WSV[i*2+1] + WarmUpRate) {
                        WSV[i*2 + 1] += WarmUpRate
                    }
                    else {
                        WSV[i*2 + 1] = PLCMemory.D[i*2+801]
                    }
                    if (PLCMemory.D[i*6+303] !== WSV[i*2+1])
                        window.ipcRenderer.send("plcWrite", `D${i*6+303}`, WSV[i*2+1])
                }
            }
        }
    }
    AlarmCheck = () => {
        let alarms = AlarmCheck()
        console.log(alarms);
    }
    componentDidMount() {
        //console.log("componentDidMount")
        this.warmUpIntervalTimer = setInterval(this.SFWarmUp, 1000)
        //this.alarmCheckIntervalTimer = setInterval(this.AlarmCheck, 1000)
        //const menu = new window.remote.Menu()
        //menu.append(new window.remote.MenuItem({ label: 'MenuItem1', click() { console.log('item 1 clicked') } }))
        //menu.append(new window.remote.MenuItem({ type: 'separator' }))
        //menu.append(new window.remote.MenuItem({ label: 'MenuItem2', type: 'checkbox', checked: true }))

        //window.addEventListener('contextmenu', (e) => {
        //  e.preventDefault()
        //  menu.popup({ window: window.remote.getCurrentWindow() })
        //}, false)
        window.ipcRenderer.on("SF_MENU_MAINCONTROL", (event) => {
            this.setState({
                controlVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_CONVEYORSETTING", (event) => {
            this.setState({
                conveyorSettingVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_ZONESETTING", (event) => {
            this.setState({
                zoneSettingVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_PROFILESETTING", (event) => {
            this.setState({
                zoneTSVSettingVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_WARMUPSETTING", (event) => {
            this.setState({
                warmUpSettingVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_WETTERSETTING", (event) => {
            this.setState({
                wetterSettingVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_GASSETTING", (event) => {
            this.setState({
                gasSettingVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_AlARMVIEWER", (event) => {
            this.setState({
                alarmVisible: true,
            })
        });
        window.ipcRenderer.on("SF_MENU_START", (event) => {
            this.setState({
                loadingStart: true,
            })
            //readConfigFile().then(res => {
                //console.log('then', res)
                //this.SFMainStart()
            //})
            //.then(data => {
            //    console.log(data)
            //    this.SFMainStart()
            //})
        })

        window.ipcRenderer.on("SF_MENU_STOP", (event) => {
            this.SFMainStop()
        })

        window.ipcRenderer.on('ping', (event, message) => { 
            //console.log(message) 
        });
        window.ipcRenderer.on('plcReaded', (event, message) => { 
            //console.log(message) 
        });
        window.ipcRenderer.on('plcReply', (event, message, address) => { 
            //console.log(message, address) 
            let tempData = [...PLCMemory[address[0]]]
            //let { D, W, C } = this.state;
            //let { D } = PLCMemory;
            message.values.map((d, index)=>{
                tempData[address[1]+index]=d;
                return null;
            })
            //if (address[0] === "D") {
            //    D = tempData;
            //}
            //else if (address[0] === "W") {
            //    W = tempData;
            //}
            //else if (address[0] === "C") {
            //    C = tempData;
            //}
            //let ltempZone = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`L${index+1}`]:{'PV':D[index*4], 'TSV':D[index*2+800], 'SV':D[index*6+300], 'MV':D[index*4+1]}})));
            //let rtempZone = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`R${index+1}`]:{'PV':D[index*4+2], 'TSV':D[index*2+801], 'SV':D[index*6+303], 'MV':D[index*4+3]}})));
            
            //let lZonePV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`L${index+1}`]:D[index*4]})));
            //lZonePV['name'] = 'PV'
            //let lZoneTSV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`L${index+1}`]:D[index*2+800]})));
            //lZoneTSV['name'] = 'TSV'
            //let lZoneSV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`L${index+1}`]:D[index*6+300]})));
            //lZoneSV['name'] = 'SV'
            //let lZoneMV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`L${index+1}`]:D[index*4+1]/10})));
            //lZoneMV['name'] = 'MV'
            //let lZone = [lZonePV, lZoneTSV, lZoneSV, lZoneMV]
            //
            //let rZonePV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`R${index+1}`]:D[index*4+2]})));
            //rZonePV['name'] = 'PV'
            //let rZoneTSV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`R${index+1}`]:D[index*2+801]})));
            //rZoneTSV['name'] = 'TSV'
            //let rZoneSV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`R${index+1}`]:D[index*6+303]})));
            //rZoneSV['name'] = 'SV'
            //let rZoneMV = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`R${index+1}`]:D[index*4+3]/10})));
            //rZoneMV['name'] = 'MV'
            //let rZone = [rZonePV, rZoneTSV, rZoneSV, rZoneMV]
            //let tempZone = {...ltempZone, ...rtempZone};
            //console.log(this.state[address[0]] !== tempData, this.state.ltempZone != ltempZone, this.state.rtempZone != rtempZone, this.state.lZone != lZone, this.state.rZone != rZone)
            //console.log(this.state.ltempZone, ltempZone)
            //if (this.state[address[0]] !== tempData || this.state.ltempZone !== ltempZone || this.state.rtempZone !== rtempZone || this.state.lZone !== lZone || this.state.rZone !== rZone) {
            //console.log(this.state[address[0]], tempData)
            //console.log(JSON.stringify(this.state[address[0]]) !== JSON.stringify(tempData))
            //console.log(lZone)
            if (JSON.stringify(PLCMemory[address[0]]) !== JSON.stringify(tempData)) {
                PLCMemory[address[0]] = tempData;
                //this.setState({
                //    //ltempZone: ltempZone,
                //    //rtempZone: rtempZone,
                //    lZone: lZone,
                //    rZone: rZone,
                //});
            }
        });
    }
    //componentDidUpdate() {
    //    let ltempZone = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`L${index+1}`]:{'PV':this.state.D[index*4], 'TSV':this.state.D[index*2+800], 'SV':this.state.D[index*6+300], 'MV':this.state.D[index*4+1]}})));
    //    let rtempZone = Object.assign({}, ...Array(24).fill().map((d, index)=>({[`R${index+1}`]:{'PV':this.state.D[index*4+2], 'TSV':this.state.D[index*2+801], 'SV':this.state.D[index*6+303], 'MV':this.state.D[index*4+3]}})));
    //    let tempZone = {...ltempZone, ...rtempZone};
    //    this.setState({
    //        tempZone: tempZone,
    //    })
    //    //console.log(tempZone);
    //}
    render() {
      let lzone = [
            {
              name: "PV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 0, 4)
            },
            {
              name: "TSV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 800, 2)
            },
            {
              name: "SV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 300, 6)
            },
            {
              name: "MV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 1, 4, d=>(d/10))
            }
      ]
        let rzone = [
            {
              name: "PV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 2, 4)
            },
            {
              name: "TSV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 801, 2)
            },
            {
              name: "SV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 303, 6)
            },
            {
              name: "MV",
            ...GetIntervalDataDict(zoneNames.L, PLCMemory.D, 3, 4, d=>(d/10))
            }
        ]
        let headBtns = [
            ["功能开关", "controlVisible"],
            ["传送带设定", "conveyorSettingVisible"],
            ["温度设定", "zoneTSVSettingVisible"],
            ["升温设定", "warmUpSettingVisible"],
            ["加湿设定", "wetterSettingVisible"],
            ["气氛设定", "gasSettingVisible"],
        ]

      return (
        <div className="App" style={{backgroundColor:"#FAFAFA", padding:10}}>
              <ControlModal
                visible={this.state.controlVisible} 
                onOk={()=>{this.setState({controlVisible:false})}} 
                onCancel={()=>{this.setState({controlVisible:false})}} 
              />
            <ConveyorSettingModal
                visible={this.state.conveyorSettingVisible} 
                onOk={()=>{this.setState({conveyorSettingVisible:false})}} 
                onCancel={()=>{this.setState({conveyorSettingVisible:false})}} 
            />
            <ZoneSettingModal
                visible={this.state.zoneSettingVisible} 
                onOk={()=>{this.setState({zoneSettingVisible:false})}} 
                onCancel={()=>{this.setState({zoneSettingVisible:false})}} 
            />
            <ZoneTSVSettingModal
                visible={this.state.zoneTSVSettingVisible} 
                onOk={()=>{this.setState({zoneTSVSettingVisible:false})}} 
                onCancel={()=>{this.setState({zoneTSVSettingVisible:false})}} 
            />
            <WarmUpSettingModal
                second={this.state.warmUpSecond}
                visible={this.state.warmUpSettingVisible} 
                onOk={()=>{this.setState({warmUpSettingVisible:false})}} 
                onCancel={()=>{this.setState({warmUpSettingVisible:false})}} 
            />
            <WetterSettingDrawer
                visible={this.state.wetterSettingVisible} 
                onClose={()=>this.setState({wetterSettingVisible:false})}
            />
            <GasSettingDrawer
                visible={this.state.gasSettingVisible} 
                onClose={()=>this.setState({gasSettingVisible:false})}
            />
            <LoadingModal
                start={this.state.loadingStart}
                SFMainStart={this.SFMainStart}
                onClose={()=>{
                    this.setState({
                        loadingStart: false,
                    })
                }}
            />
            <AlarmsModal
                visible={this.state.alarmVisible}
                onClose={()=>{this.setState({
                    alarmVisible: false
                })}}
            />
          <div className="functionButtons">
            <Row align="middle" gutter={[16, 4]}>
                <Col>
                    <Button type="primary" icon={<CaretRightOutlined />} onClick={()=> {
                        this.setState({
                            loadingStart: true
                        })
                    }}
                    >
                        启 动
                    </Button>
                </Col>
                <Col>
                    <Button type="primary" icon={<PauseOutlined />} onClick={()=>{
                        this.SFMainStop();
                    }}
                    >
                        停 止
                    </Button>
                </Col>
                { headBtns.map((d)=>(
                <Col key={d[0]}>
                    <Button 
                        type="primary" 
                        onClick={()=>{
                            this.setState({
                                [d[1]]: true,
                            })
                        }}
                    >
                        {d[0]}
                    </Button>
                </Col>
                ))}
                <Col>
                    <Badge count={AlarmCheck().length} overflowCount={999}>
                        <Button type="primary" onClick={() => {
                            this.setState({
                                alarmVisible: true
                            })
                        }}>报 警</Button>
                    </Badge>
                </Col>
            </Row>
          </div>
          <Tabs type="card">
            <Tabs.TabPane tab={<span><LineChartOutlined />Zone Chart</span>} key="1">
              <ChartWrapper>
                <TempChart data={Array(24).fill().map((d, index)=>({name:`L${index+1}`, 'PV':PLCMemory.D[index*4], 'TSV':PLCMemory.D[index*2+800], 'SV':PLCMemory.D[index*6+300], 'MV':PLCMemory.D[index*4+1]}))} />
              </ChartWrapper>
              <ChartWrapper>
                <TempChart data={Array(24).fill().map((d, index)=>({name:`R${index+1}`, 'PV':PLCMemory.D[index*4+2], 'TSV':PLCMemory.D[index*2+801], 'SV':PLCMemory.D[index*6+303], 'MV':PLCMemory.D[index*4+3]}))} />
              </ChartWrapper>
            </Tabs.TabPane>
            <Tabs.TabPane tab={<span><TableOutlined />Zone Table</span>} key="2">
              <TemplateTable data={lzone} />
              <TemplateTable data={rzone} />
            </Tabs.TabPane>
          </Tabs>
          <MainInfoTable />
          {/*<Divider style={{margin: "0px 0px 12px 0px"}}/>*/}
          <div style={{margin:0}}>
              <Row align="middle">
                <Col><StateIcon component={HeatingSvg} run={(PLCMemory.W[290]&1)===1}/></Col><Col flex={1}><Typography.Title level={4} style={{margin:0}}>主加热</Typography.Title></Col>
                <Col><StateIcon component={ConveyorSvg} run={(PLCMemory.W[291]&0x10)===0x10}/></Col><Col flex={1}><Typography.Title level={4} style={{margin:0}}>传送带</Typography.Title></Col>
                {/*<IconDisplayer address="WB0311:01" icon={SoundSvg} label="超声波" rotate={90} />
                <IconDisplayer address="WB0291:12" icon={pumpSvg} label="风淋PUMP" rotate={90}/>
                <IconDisplayer address="WB0291:13" icon={pumpSvg} label="入口排水" rotate={90}/>*/}
                <IconDisplayer address="WB0292:00" icon={ValveSvg} label={<span>N<sub>2</sub>气体</span>} />
                <IconDisplayer address="WB0291:15" icon={ValveSvg} label={<span>H<sub>2</sub>气体</span>} />
                <Col flex={8} />
                {/*<IconDisplayer address="WB0311:04" icon={ValveSvg} label="Sonic Air" />*/}
              </Row>
          </div>
        </div>
      );
    }
}

export default App;
