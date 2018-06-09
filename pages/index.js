import axios from 'axios';
import Link from 'next/link';
import Pusher from 'pusher-js';
import React, { Component, Fragment } from 'react';
import * as Session from '../helpers/session';

import Post from '../components/Post';
import Layout from '../components/Layout';
import ChoosePersona from '../components/ChoosePersona';

class IndexPage extends Component {

	state = { user: null, people: [], posts: [] }

	personaSelected = user => this.setState({ user }, () => Session.initializeSession(user))

	componentDidMount() {
		const user = Session.getActiveUser();
		user && this.setState({ user });

		this.pusher = new Pusher(process.env.PUSHER_APP_KEY, {
			cluster: process.env.PUSHER_APP_CLUSTER,
			encrypted: true
		});

		this.channel = this.pusher.subscribe('twitter-poll-app');

		this.pusher.connection.bind('connected', () => {

			axios.get('/api/users').then(({ data }) => {
				const { users: people = [] } = data;
				this.setState({ people });
			});

			axios.get('/api/posts').then(({ data }) => {
				const { posts = [] } = data;
				this.setState({ posts });
			});

		});
	}

	componentWillUnmount() {
		this.pusher.disconnect();
	}

	render() {
		return <Fragment>
			{ this.state.user

				? ( this.state.posts.length > 0

						? <div className="align-self-start my-4" style={{ maxWidth: 640 }}>
							{ this.state.posts.map((post, index) => {
								return <Post key={index} user={this.state.user} people={this.state.people} post={post} />
							}) }
						</div>

						: <Fragment>
							<h1 className="font-weight-light w-100 text-center mb-3">Realtime Twitter-Style Poll</h1>

							<Link prefetch replace passHref href="/post">
								<button className="btn btn-link text-uppercase font-weight-bold ml-3 px-0" style={{ textDecoration: 'none', fontSize: '0.9rem' }}>New Post</button>
							</Link>
						</Fragment>
				)

				: <ChoosePersona count={5} people={this.state.people} onSelected={this.personaSelected} />
			}
		</Fragment>
	}
}

export default () => (
	<Layout>
		<div className="container-fluid position-absolute h-100">
			<div className="d-flex position-relative h-100 w-50 mx-auto flex-wrap justify-content-center align-items-center align-content-center">
				<IndexPage />
			</div>
		</div>
	</Layout>
);
