import React from 'react';

import './meeting.css'
import Description from './description';


class Meeting extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            need_desc: false,
            is_clicked: false,
        }

        this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
        this.setState({
            is_clicked: true,
        })
        this.props.onClickCallback(this.props.id, !this.state.need_desc);
        if (!this.state.need_desc) {
            this.setState({
                need_desc: true,
            })
        } else {
            this.setState({
                need_desc: false,
            })
        }
    }

    renderDescription() {
        if (this.state.is_clicked && this.state.need_desc) {
            return (
                <Description
                    meeting={this.props.meeting}
                    is_horizontal={this.props.is_horizontal}
                    stripe_width={this.props.stripe_width}
                    stripe_height={this.props.stripe_height}
                />
            )
        }
    }

    renderMeeting() {
        let start_hour = Number(this.props.meeting.start.split(':')[0])
        let start_minute = Number(this.props.meeting.start.split(':')[1])
        let end_hour = Number(this.props.meeting.end.split(':')[0])
        let end_minute = Number(this.props.meeting.end.split(':')[1])
        let start_time = start_hour * 60 + start_minute
        let end_time = end_hour * 60 + end_minute
        let all_time = 24 * 60
        let parent_width = this.props.stripe_width
        let parent_height = this.props.stripe_height
        let width, height;
        if (this.props.is_horizontal) {
            width = Math.round((end_time - start_time) / all_time * parent_width)
            height = parent_height
        } else {
            width = parent_width
            height = Math.round((end_time - start_time) / all_time * parent_height)
        }
        let style = {
            width: width.toString() + 'px',
            height: height.toString() + 'px',
            zIndex: this.props.z_index,
            backgroundColor: this.props.color + '88'
        }
        if (this.props.is_horizontal) {
            style.left = Math.round(start_time / all_time * parent_width)
        } else {
            style.top = Math.round(start_time / all_time * parent_height) + this.props.top
        }
        return (
            <div
                className='rcs-stripe-meeting'
                style={style}
                onClick={this.onClick}
            >
                {this.renderDescription()}
            </div>
        )
    }

    render() {
        return this.renderMeeting()
    }
}

export default Meeting
