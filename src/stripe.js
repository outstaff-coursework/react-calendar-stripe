import React from 'react';
import Meeting from './meeting.js'

import './stripe.css'


class Stripe extends React.Component {
    colors = ['#17ccf9', '#3dc5f7', '#53bdf5', '#73acf1', '#a185e9', '#be61af', '#d82354', '#d02867', '#c72d77', '#a94092']

    constructor(props) {
        super(props)
        
        let meetings_z_index = []
        for (let i = 0; i < props.data.meetings.length; i++) {
            meetings_z_index[i] = 1 + i
        }

        this.state = {
            data: this.props.data,
            meetings_z_index: meetings_z_index,
            stripe_width: 1,
            stripe_height: 1,
            adding_new_meeting: false,
            block_adding_new_meetings: false,
        }

        this.onClickCallback = this.onClickCallback.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseLeave = this.handleMouseLeave.bind(this);
        this.ref = React.createRef()
    }

    componentDidMount() {
        this.setState({
            stripe_width: this.ref.current.getBoundingClientRect().width,
            stripe_height: this.ref.current.getBoundingClientRect().height,
            top: this.ref.current.getBoundingClientRect().y,
        })
    }

    onClickCallback(index, need_desc) {
        if (need_desc) {
            this.setState({block_adding_new_meetings: true})
            let new_mzi = this.state.meetings_z_index
            let prev = new_mzi[index]
            for (let i = 0; i < new_mzi.length; i++) {
                if (i === index) {
                    new_mzi[i] = 1
                    continue
                }
                if (new_mzi[i] < prev) {
                    new_mzi[i]++
                }
            }
            this.setState({
                meetings_z_index: new_mzi,
            })
        } else {
            this.setState({block_adding_new_meetings: false})
        }
    }

    renderMeetings() {
        let result = []
        let index = 0
        this.state.data.meetings.forEach(meeting => {
            result.push(
                <Meeting
                    meeting={meeting}
                    id={index}
                    z_index={this.state.meetings_z_index[index]}
                    color={this.colors[index % this.colors.length]}
                    onClickCallback={this.onClickCallback}
                    is_horizontal={this.props.is_horizontal}
                    stripe_width={this.state.stripe_width}
                    stripe_height={this.state.stripe_height}
                    top={this.state.top}
                ></Meeting>
            )
            index++
        })
        return result
    }

    renderNewMeeting() {
        if (!this.state.adding_new_meeting) {
            return (
                <div></div>
            )
        }
        let width = this.state.end_x - this.state.start_x
        let height = this.state.end_y - this.state.start_y
        let style = {
            left: this.state.start_x.toString() + 'px',
            top: this.state.start_y.toString() + 'px',
            width: width.toString() + 'px',
            height: height.toString() + 'px',
        }
        return (
            <div
                className='rcs-stripe-new-meeting'
                style={style}
            ></div>
        )
    }

    renderSpacers() {
        let result = []
        let delta = this.state.stripe_width / 24;
        if (!this.props.is_horizontal) {
            delta = this.state.stripe_height / 24;
        }
        for (let i = 1; i < 24; i++) {
            let width, height
            if (this.props.is_horizontal) {
                width = 2
                height = this.state.stripe_height
            } else {
                width = this.state.stripe_width
                height = 2
            }
            let style = {
                width: width.toString() + 'px',
                height: height.toString() + 'px',
            }
            if (this.props.is_horizontal) {
                style.left = delta * i
            } else {
                style.top = this.state.top + delta * i
            }
            result.push(
                <div
                    className='rcs-stripe-spacer'
                    style={style}
                ></div>
            )
        }
        return result
    }

    async handleMouseDown(event) {
        if (this.state.block_adding_new_meetings || this.props.readonly) {
            return;
        }
        let start_x;
        let start_y;
        let end_x;
        let end_y;
        if (this.props.is_horizontal) {
            start_x = Math.round(Math.floor(event.clientX / this.state.stripe_width * 48) / 48 * this.state.stripe_width) - this.ref.current.getBoundingClientRect().x - 5
            start_y = event.target.offsetTop
            end_x = start_x
            end_y = this.state.stripe_height + event.target.offsetTop
        } else {
            start_x = event.target.offsetLeft
            start_y = Math.round(Math.floor(event.clientY / this.state.stripe_height * 48) / 48 * this.state.stripe_height)
            end_x = this.state.stripe_width + event.target.offsetLeft
            end_y = start_y
        }
        await this.setState({
            adding_new_meeting: true,
            start_x: start_x,
            start_y: start_y,
            end_x: end_x,
            end_y: end_y,
        })
    }

    async handleMouseUp(event) {
        if (!this.state.adding_new_meeting || this.state.block_adding_new_meetings || this.props.readonly) {
            return
        }
        let end_x;
        let end_y;
        if (this.props.is_horizontal) {
            end_x = Math.round(Math.floor(event.clientX / this.state.stripe_width * 48) / 48 * this.state.stripe_width) - this.ref.current.getBoundingClientRect().x - 5
            end_y = this.state.stripe_height + event.target.offsetTop
        } else {
            end_x = this.state.stripe_width + event.target.offsetLeft
            end_y = Math.round(Math.floor(event.clientY / this.state.stripe_height * 48) / 48 * this.state.stripe_height - this.ref.current.getBoundingClientRect().y - 5)
        }
        await this.setState({
            adding_new_meeting: false,
            end_x: end_x,
            end_y: end_y,
        })
        
        let start_time;
        let end_time;
        if (this.props.is_horizontal) {
            start_time = Math.round(this.state.start_x / this.state.stripe_width * 48)
            end_time = Math.round(this.state.end_x / this.state.stripe_width * 48)
        } else {
            start_time = Math.round((this.state.start_y - this.ref.current.getBoundingClientRect().y - 5) / this.state.stripe_height * 48)
            end_time = Math.round(this.state.end_y / this.state.stripe_height * 48)
        }
        let start_minutes = '00'
        let end_minutes = '00'
        if (start_time % 2 != 0) {
            start_minutes = '30'
            start_time = Math.round((start_time - 1) / 2)
        } else {
            start_time = Math.round(start_time / 2)
        }
        if (end_time % 2 != 0) {
            end_minutes = '30'
            end_time = Math.round((end_time - 1) / 2)
        } else {
            end_time = Math.round(end_time / 2)
        }
        if (start_time > 9) {
            start_time = start_time.toString()
        } else {
            start_time = '0' + start_time.toString()
        }
        if (end_time > 9) {
            end_time = end_time.toString()
        } else {
            end_time = '0' + end_time.toString()
        }
        if (start_time === end_time) {
            return
        }
        /* let data = this.state.data
        data.meetings.push({
            start: start_time + ':' + start_minutes,
            end: end_time + ':' + end_minutes,
            name: "Встреча 2",
            description: "Длинное описание встречи",
            participants: ["Иван Иванов", "Пётр Петров"]
        })
        let meetings_z_index = this.state.meetings_z_index
        meetings_z_index.push(1 + meetings_z_index.length)

        await this.setState({
            data: data,
            meetings_z_index: meetings_z_index,
        }) */
        
        let start_date = new Date(this.props.date + "T" + start_time + ":" + start_minutes);
        console.log(this.props.date, end_time, end_minutes)
        let end_date = new Date(this.props.date + "T" + end_time + ":" + end_minutes);
        start_date = start_date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        end_date = end_date.toISOString().replace(/-|:|\.\d\d\d/g, "");
        window.open('https://www.google.com/calendar/render?action=TEMPLATE&text=Встреча&dates=' + start_date + '/' + end_date, '_blank', 'noopener,noreferrer');
    }

    async handleMouseMove(event) {
        if (!this.state.adding_new_meeting || this.state.block_adding_new_meetings || this.props.readonly) {
            return
        }
        let end_x;
        let end_y;
        if (this.props.is_horizontal) {
            end_x = Math.round(Math.floor(event.clientX / this.state.stripe_width * 48) / 48 * this.state.stripe_width) - this.ref.current.getBoundingClientRect().x - 5
            end_y = this.state.stripe_height + event.target.offsetTop
        } else {
            end_x = this.state.stripe_width + event.target.offsetLeft
            end_y = Math.round(Math.floor(event.clientY / this.state.stripe_height * 48) / 48 * this.state.stripe_height)
        }
        await this.setState({
            end_x: end_x,
            end_y: end_y,
        })
    }

    async handleMouseLeave(event) {
        if (!this.state.adding_new_meeting || this.state.block_adding_new_meetings || this.props.readonly) {
            return
        }
        await this.setState({ adding_new_meeting: false });
    }

    render() {
        return (
            <div className='rcs-stripe' ref={this.ref} onMouseDown={this.handleMouseDown} onMouseUp={this.handleMouseUp} onMouseMove={this.handleMouseMove} onMouseLeave={this.handleMouseLeave}>
                {this.renderSpacers()}
                {this.renderMeetings()}
                {this.renderNewMeeting()}
            </div>
        )
    }
}

export default Stripe
