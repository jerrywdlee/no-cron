FROM node:10.15.3-alpine
LABEL maintainer="Jerry Lee <jerrywdlee@gmail.com>"
RUN set -x && apk update && apk upgrade\
    && apk add --no-cache git tzdata

ENV NODE_ENV production
ENV TZ Asia/Tokyo
ENV TEST_CRON_ENV no-cron

WORKDIR /root
RUN git clone https://github.com/jerrywdlee/no-cron.git

WORKDIR /root/no-cron
RUN npm i && npm i -g pm2

RUN mkdir -p /logs && touch /logs/cron.log
#RUN echo '* * * * * /bin/sh -l -c "echo `date` $TEST_CRON_ENV >> /logs/cron.log 2>&1"'\
#    >> /var/spool/cron/crontabs/root
RUN echo '* * * * * echo `date` $TEST_CRON_ENV >> /logs/cron.log 2>&1'\
    >> /var/spool/cron/crontabs/root

# Only active system cron
# CMD /bin/sh -c "crond -b && tail -f /logs/cron.log"
# Only active no-cron
# CMD /bin/sh -c "pm2 start cron.js && tail -f /logs/cron.log"
# Both active system cron and no-cron
CMD /bin/sh -c "pm2 start cron.js && crond -b && tail -f /logs/cron.log"
